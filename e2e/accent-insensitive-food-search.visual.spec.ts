import { test, expect } from '@playwright/test';

async function seedFrenchGuest(page: any) {
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'fr');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('nimmapp_moments_v1', '[]');
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });
}

test('French meal capture finds accented foods when typed without accents', async ({ page }) => {
  await seedFrenchGuest(page);
  await page.route('**/api/locale', async (route: any) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ country: 'FR' }),
  }));
  await page.route('**/api/food-autocomplete', async (route: any) => route.fulfill({
    status: 500,
    contentType: 'application/json',
    body: '{}',
  }));

  await page.goto('/');
  await page.getByTestId('primary-capture-button').click();
  await page.getByRole('button', { name: 'Photo', exact: true }).click();

  const input = page.getByPlaceholder('Commence à écrire… ex. pâtes au poulet');
  await expect(input).toBeVisible();
  await input.fill('creme bru');

  const suggestion = page.getByRole('button', { name: /^Crème brûlée/ });
  await expect(suggestion).toBeVisible();
  await suggestion.click();
  await expect(input).toHaveValue('');

  await page.getByRole('button', { name: 'Enregistrer le repas', exact: true }).click();
  await expect(page.getByText('Crème brûlée', { exact: true })).toBeVisible();
});
