import { expect, test } from '@playwright/test';

async function seedReturningGuest(page: any, language: 'en' | 'fr') {
  await page.addInitScript(({ language }) => {
    localStorage.setItem('rhythm_language_v1', language);
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('nimmapp_moments_v1', '[]');
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  }, { language });
}

test('mobile language menu switches directly between French, Arabic, German and English', async ({ page }) => {
  await seedReturningGuest(page, 'en');

  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Choose language' })).toBeVisible();

  await page.getByRole('button', { name: 'Choose language' }).click();
  await page.locator('[data-language-option="fr"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByRole('button', { name: 'Découvertes', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mes moments', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Choisir la langue' })).toBeVisible();

  await page.getByRole('button', { name: 'Choisir la langue' }).click();
  await page.locator('[data-language-option="ar"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

  await page.getByRole('button', { name: 'اختر اللغة' }).click();
  await page.locator('[data-language-option="de"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(page.getByRole('button', { name: 'Sprache wählen' })).toBeVisible();

  await page.getByRole('button', { name: 'Sprache wählen' }).click();
  await page.locator('[data-language-option="en"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('button', { name: 'Choose language' })).toBeVisible();
});

test('French selection persists after reload', async ({ page }) => {
  await seedReturningGuest(page, 'fr');

  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByRole('button', { name: 'Découvertes', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByRole('button', { name: 'Choisir la langue' })).toBeVisible();
});
