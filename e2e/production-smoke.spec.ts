import { test, expect } from '@playwright/test';

test('Arabic guest captures and retains a meal', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'fr');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });
  const response = await page.goto('/');
  expect(response?.ok()).toBe(true);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.getByRole('button', { name: 'سجّل لحظة' }).first().click();
  await page.getByRole('button', { name: 'صورة', exact: true }).click();
  const input = page.getByPlaceholder('ابدأ بالكتابة… مثلاً طاجين');
  // Keep this real smoke independent of the runner's geolocated country.
  // Country packs vary by /api/locale, while Tiramisu is part of the global
  // catalogue and still exercises Latin input -> Arabic persisted display.
  await input.fill('tiramisu');
  const suggestion = page.getByRole('button', { name: /^Tiramisu/ });
  await expect(suggestion).toBeVisible();
  await suggestion.click();
  await expect(input).toHaveValue('');
  await page.getByRole('button', { name: 'حفظ الوجبة', exact: true }).click();
  await expect(page.getByText('تيراميسو', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('تيراميسو', { exact: true })).toBeVisible();
});
