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

test('mobile language picker traps focus and restores it to the opener', async ({ page }) => {
  await seedReturningGuest(page);
  await page.goto('/');

  const opener = page.getByRole('button', { name: 'Choose language' });
  await expect(opener).toBeVisible();
  await opener.click();

  const dialog = page.getByRole('dialog', { name: 'Choose language' });
  await expect(dialog).toBeVisible();
  await expect(page.locator('[data-language-option="en"]')).toBeFocused();

  const close = dialog.getByRole('button', { name: 'Close' });
  await close.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('[data-language-option="ar"]')).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();

  await page.screenshot({ path: 'test-results/language-picker-accessibility-mobile.png', fullPage: true });
});
