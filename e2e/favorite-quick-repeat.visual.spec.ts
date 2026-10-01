import { expect, test } from '@playwright/test';

const favorite = {
  id: 'favorite-real-1',
  title: 'بيض مسلوق',
  label: 'بيض مسلوق',
  category: 'breakfast',
  date: '2026-09-30',
  time: '08:00',
  location: '',
  imageUrl: '',
  rating: 5,
  tags: [],
  createdAt: 1790732800000,
  isFavorite: true,
};

test('favorite meal is available as a one-tap Add shortcut', async ({ page }) => {
  await page.addInitScript((moment) => {
    localStorage.setItem('rhythm_language_v1', 'en');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('nimmapp_moments_v1', JSON.stringify([moment]));
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  }, favorite);

  await page.goto('/');
  await page.getByTestId('primary-capture-button').click();

  const favorites = page.getByTestId('favorite-repeat-row');
  await expect(favorites).toBeVisible();
  await expect(favorites).toContainText('Favorites');
  await expect(favorites.getByRole('button', { name: 'بيض مسلوق' })).toBeVisible();
  await expect(page.getByTestId('recent-repeat-row')).toBeVisible();
  await page.screenshot({ path: 'test-results/favorite-quick-repeat.png', fullPage: true });
});
