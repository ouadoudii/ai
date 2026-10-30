import { test, expect } from '@playwright/test';

test('Arabic is the default UI for new and returning users', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'fr');
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('body')).toHaveAttribute('dir', 'rtl');
});

test('Arabic remains the UI with an English browser locale', async ({ page }) => {
  await page.addInitScript(() => localStorage.removeItem('rhythm_language_v1'));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});


for (const viewport of [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test(`Arabic-only UI remains RTL after a legacy preference changes during ${viewport.name} use`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.addInitScript(() => {
      if (!localStorage.getItem('rhythm_language_v1')) localStorage.setItem('rhythm_language_v1', 'en');
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
      localStorage.setItem('nimmapp_moments_v1', '[]');
      localStorage.setItem('nimmapp_checkins_v1', '[]');
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await page.evaluate(() => {
      localStorage.setItem('rhythm_language_v1', 'de');
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'rhythm_language_v1', newValue: 'de',
      }));
    });
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('body')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByText('سجّل يومك', { exact: true })).toBeVisible();
    await expect(page.locator('[data-language-option]')).toHaveCount(0);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByText('سجّل يومك', { exact: true })).toBeVisible();
    await expect(page.locator('[data-language-option]')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => localStorage.getItem('rhythm_language_v1'))).toBe('de');
  });
}
