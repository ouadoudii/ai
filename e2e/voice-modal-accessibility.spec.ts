import { expect, test } from '@playwright/test';

async function prepare(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'ar');
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
  return { opener, dialog: page.getByRole('dialog', { name: 'قل ماذا أكلت' }) };
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
    await expect(dialog.getByRole('button', { name: 'إغلاق' })).toBeFocused();
    await expect(page.locator('main')).toHaveAttribute('inert', '');

    const first = dialog.getByRole('button', { name: 'رجوع' });
    const last = dialog.getByRole('button', { name: 'ابدأ التسجيل' });
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
    class FakeRecorder {
      state = 'inactive';
      mimeType = 'audio/webm';
      ondataavailable: ((event: { data: Blob }) => void) | null = null;
      onstop: (() => void) | null = null;
      constructor(_stream: unknown) {}
      start() { this.state = 'recording'; (window as any).__voiceStarts = ((window as any).__voiceStarts || 0) + 1; }
      stop() {
        this.state = 'inactive';
        (window as any).__voiceStops = ((window as any).__voiceStops || 0) + 1;
        this.ondataavailable?.({ data: new Blob(['voice'], { type: 'audio/webm' }) });
        this.onstop?.();
      }
    }
    (window as any).MediaRecorder = FakeRecorder;
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] }) },
    });
  });
  await prepare(page);
  const captureViewport = await page.getByTestId('desktop-capture-button').isVisible() ? 'desktop' : 'mobile';
  const { dialog } = await openVoice(page, captureViewport);
  await dialog.getByRole('button', { name: 'ابدأ التسجيل' }).click();
  await expect(dialog.getByRole('button', { name: 'إيقاف التسجيل' })).toBeVisible();

  await page.keyboard.press('Escape');

  await expect(dialog).toBeHidden();
  await expect.poll(() => page.evaluate(() => (window as any).__voiceStops || 0)).toBe(1);
});
