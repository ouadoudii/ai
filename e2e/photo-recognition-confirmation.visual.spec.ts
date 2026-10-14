import { expect, test } from '@playwright/test';

async function prepare(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1','en');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify({ displayName: 'Test', completedAt: new Date().toISOString() }));
    localStorage.setItem('rhythm_voice_entry_seen_v1','true');
    localStorage.setItem('nimmapp_moments_v1','[]');
    localStorage.setItem('nimmapp_checkins_v1','[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');

    class FakeWorker {
      onmessage: ((event: { data: unknown }) => void) | null = null;
      onerror: ((event: unknown) => void) | null = null;
      postMessage(message: { id: number; type: string }) {
        if (message.type !== 'image') return;
        setTimeout(() => this.onmessage?.({
          data: {
            id: message.id,
            results: [
              { label: 'pizza', score: 0.91 },
              { label: 'sandwich', score: 0.83 },
            ],
          },
        }), 0);
      }
      terminate() {}
    }

    Object.defineProperty(window, 'Worker', { configurable: true, writable: true, value: FakeWorker });
  });
  await page.goto('/');
}

async function openPhotoCapture(page: import('@playwright/test').Page, mobile: boolean) {
  const add = mobile
    ? page.getByTestId('primary-capture-button')
    : page.getByRole('button', { name: 'Add a moment', exact: true }).filter({ visible: true }).first();
  await expect(add).toBeVisible();
  await add.click();
  await page.locator('[data-capture-method="photo"]').click();
  const fileInput = page.locator('input[type="file"][accept="image/*"]');
  await expect(fileInput).toHaveCount(1);
  await fileInput.setInputFiles({
    name: 'meal.png',
    mimeType: 'image/png',
    buffer: Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]),
  });
}

for (const viewport of [
  { name: 'desktop', width: 1280, height: 900, edit: false },
  { name: 'mobile', width: 390, height: 844, edit: true },
]) {
  test(`photo recognition requires explicit confirmation (${viewport.name})`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await prepare(page);
    await openPhotoCapture(page, viewport.name === 'mobile');

    const suggestions = page.getByTestId('photo-recognition-suggestions');
    await expect(suggestions).toBeVisible();
    await expect(suggestions).toContainText('pizza');
    await expect(suggestions).toContainText('sandwich');

    const typedInput = page.locator('input[autocomplete="off"]');
    await expect(typedInput).toHaveValue('');

    const save = page.getByRole('button', { name: 'Save meal', exact: true });
    await expect(save).toBeDisabled();

    const useSecond = page.getByTestId('photo-suggestion-use-1');
    await useSecond.click();
    await expect(useSecond).toHaveAttribute('aria-pressed','true');
    await expect(save).toBeEnabled();

    if (viewport.edit) {
      await page.getByTestId('photo-suggestion-edit-1').click();
      await expect(typedInput).toHaveValue('sandwich');
      await typedInput.fill('grilled sandwich');
    }

    await page.screenshot({ path: testInfo.outputPath(`photo-confirmation-${viewport.name}.png`), fullPage: true });
    await save.click();

    await expect.poll(async () => page.evaluate(() => {
      const moments = JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]');
      return moments[0]?.title || '';
    })).toBe(viewport.edit ? 'grilled sandwich' : 'sandwich');
  });
}
