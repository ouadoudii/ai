import { expect, test } from '@playwright/test';

async function prepare(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'en');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify({
      summary: 'Returning user', priorities: [], preferences: [], rawIntro: 'Returning user', confirmedAt: 1,
      firstPlan: { title: 'Notice your day', rationale: 'Learn your rhythm', focusAreas: [], firstStep: 'Check in', phase: 'midday' },
    }));
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });
  await page.goto('/');
}

async function openVoice(page: import('@playwright/test').Page, viewport: 'desktop' | 'mobile') {
  const opener = viewport === 'desktop'
    ? page.getByTestId('desktop-capture-button')
    : page.getByTestId('primary-capture-button');
  await opener.click();
  await page.locator('[data-capture-method="voice"]').click();
  return { opener, dialog: page.getByRole('dialog', { name: 'Tell me what you had' }) };
}

for (const viewport of [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
] as const) {
  test(`full Voice is named, traps focus, closes with Escape and restores its opener (${viewport.name})`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await prepare(page);
    const { opener, dialog } = await openVoice(page, viewport.name);

    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();
    await expect(page.locator('main')).toHaveAttribute('inert', '');

    const first = dialog.getByRole('button', { name: 'Back' });
    const last = dialog.getByRole('button', { name: 'Start recording' });
    await first.focus();
    await page.keyboard.press('Shift+Tab');
    await expect(last).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(first).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });
}

test('Escape during recording uses the same stop-and-cancel path exactly once', async ({ page }) => {
  await page.addInitScript(() => {
    class FakeSpeechRecognition {
      lang = '';
      interimResults = false;
      continuous = false;
      onresult: ((event: unknown) => void) | null = null;
      onend: (() => void) | null = null;
      onerror: ((event: unknown) => void) | null = null;
      start() { (window as any).__voiceStarts = ((window as any).__voiceStarts || 0) + 1; }
      stop() { (window as any).__voiceStops = ((window as any).__voiceStops || 0) + 1; }
    }
    (window as any).SpeechRecognition = FakeSpeechRecognition;
    (window as any).webkitSpeechRecognition = FakeSpeechRecognition;
  });
  await prepare(page);
  const captureViewport = await page.getByTestId('desktop-capture-button').isVisible() ? 'desktop' : 'mobile';
  const { dialog } = await openVoice(page, captureViewport);
  await dialog.getByRole('button', { name: 'Start recording' }).click();
  await expect(dialog.getByRole('button', { name: 'Stop recording' })).toBeVisible();

  await page.keyboard.press('Escape');

  await expect(dialog).toBeHidden();
  await expect.poll(() => page.evaluate(() => (window as any).__voiceStops || 0)).toBe(1);
});
