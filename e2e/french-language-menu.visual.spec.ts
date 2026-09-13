import { expect, test } from '@playwright/test';

test('mobile language menu switches directly between French, Arabic, German and English', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'en');
    localStorage.setItem('nimmapp_moments_v1', '[]');
    localStorage.setItem('nimmapp_checkins_v1', '[]');
  });

  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Choose language' })).toBeVisible();

  await page.getByRole('button', { name: 'Choose language' }).click();
  await expect(page.locator('[data-language-option="fr"]')).toBeVisible();
  await page.locator('[data-language-option="fr"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByText('Découvertes', { exact: true })).toBeVisible();
  await expect(page.getByText('Mes moments', { exact: true })).toBeVisible();
  await expect(page.getByText('Langue', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Choisir la langue' }).click();
  await page.locator('[data-language-option="ar"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

  await page.getByRole('button', { name: 'اختر اللغة' }).click();
  await page.locator('[data-language-option="de"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(page.getByText('Sprache', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Sprache wählen' }).click();
  await page.locator('[data-language-option="en"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.getByText('Language', { exact: true })).toBeVisible();
});

test('French selection persists after reload', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'fr');
    localStorage.setItem('nimmapp_moments_v1', '[]');
    localStorage.setItem('nimmapp_checkins_v1', '[]');
  });

  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByText('Découvertes', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByText('Langue', { exact: true })).toBeVisible();
});
