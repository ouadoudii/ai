import { expect, test } from '@playwright/test';

type LegacyLanguage = 'en' | 'fr' | 'de' | 'ar';

async function seedReturningGuest(page: any, language: LegacyLanguage) {
  await page.addInitScript(({ language }) => {
    localStorage.setItem('rhythm_language_v1', language);
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('nimmapp_moments_v1', '[]');
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  }, { language });
}

for (const legacyLanguage of ['en', 'fr', 'de', 'ar'] as const) {
  test(`legacy ${legacyLanguage} shows only Arabic in the language picker and keeps data export`, async ({ page }) => {
    await seedReturningGuest(page, legacyLanguage);
    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    const opener = page.getByTestId('language-picker-opener').filter({ visible: true }).first();
    await expect(opener).toBeVisible();
    await opener.click();

    const dialog = page.getByRole('dialog', { name: 'اختر اللغة' });
    await expect(dialog).toBeVisible();
    const options = dialog.locator('[data-language-option]');
    await expect(options).toHaveCount(1);
    await expect(options.first()).toHaveAttribute('data-language-option', 'ar');
    await expect(options.first()).toHaveAttribute('aria-pressed', 'true');
    await expect(dialog.getByTestId('personal-data-export')).toBeVisible();
    await expect(dialog).toContainText('تصدير بياناتي');
    await expect(dialog).not.toContainText('English');
    await expect(dialog).not.toContainText('Deutsch');
    await expect(dialog).not.toContainText('Français');

    await options.first().click();
    await expect(dialog).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    // Reading a historical preference must not erase its persisted value.
    await expect.poll(() => page.evaluate(() => localStorage.getItem('rhythm_language_v1'))).toBe(legacyLanguage);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });
}

test('Arabic-only picker closes on Escape and restores focus for a legacy French profile', async ({ page }) => {
  await seedReturningGuest(page, 'fr');
  await page.goto('/');
  const opener = page.getByTestId('language-picker-opener').filter({ visible: true }).first();
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'اختر اللغة' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});
