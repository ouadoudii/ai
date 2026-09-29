import { expect, test } from '@playwright/test';

async function seedReturningGuest(page: any) {
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'en');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('nimmapp_moments_v1', '[]');
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });
}

for (const viewport of [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test(`language change restores focus to the original opener on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await seedReturningGuest(page);
    await page.goto('/');

    const opener = page.getByRole('button', { name: 'Choose language', exact: true });
    await opener.focus();
    await expect(opener).toBeFocused();
    await opener.click();

    await expect(page.getByRole('dialog', { name: 'Choose language' })).toBeVisible();
    await page.locator('[data-language-option="ar"]').click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    const arabicOpener = page.getByRole('button', { name: 'اختر اللغة', exact: true });
    await expect(arabicOpener).toBeFocused();
    await page.screenshot({ path: `test-results/language-picker-focus-${viewport.name}.png`, fullPage: true });
  });
}
