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
