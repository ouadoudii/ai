import { expect, test } from '@playwright/test';

async function openMoments(page: import('@playwright/test').Page) {
  await page.getByTestId('mobile-moments-nav').click();
  await expect(page.getByTestId('moments-timeline')).toBeVisible();
}

test('moment lifecycle persists favorite and deletion across reloads', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'en');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_intro_profile_v1', '{}');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    localStorage.setItem('nimmapp_moments_v1', JSON.stringify([{
      id: 'lifecycle-1',
      title: 'Lifecycle bowl',
      label: 'Lunch',
      category: 'lunch',
      date: '2026-09-23',
      time: '12:30',
      location: 'Home',
      locationCategory: 'home',
      imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="20" height="20"/%3E',
      rating: 5,
      mood: 'satisfied',
      tags: ['regression'],
      isFavorite: false,
      createdAt: Date.now(),
    }]));
  });

  await page.goto('/');
  await openMoments(page);
  await expect(page.getByTestId('moments-timeline')).toContainText('Lifecycle bowl');

  await page.getByTestId('moments-timeline').getByText('Lifecycle bowl', { exact: true }).click();
  await expect(page.locator('h1', { hasText: 'Lifecycle bowl' })).toBeVisible();
  await page.getByRole('button', { name: 'Favorite' }).click();

  await expect.poll(async () => {
    return page.evaluate(() => {
      const moments = JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]');
      return moments.find((moment: { id: string }) => moment.id === 'lifecycle-1')?.isFavorite;
    });
  }).toBe(true);

  await page.getByRole('button', { name: 'Close' }).click();
  await page.reload();
  await openMoments(page);
  await expect(page.getByTestId('moments-timeline')).toContainText('Lifecycle bowl');
  await expect.poll(async () => {
    return page.evaluate(() => {
      const moments = JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]');
      return moments.find((moment: { id: string }) => moment.id === 'lifecycle-1')?.isFavorite;
    });
  }).toBe(true);

  await page.getByTestId('moments-timeline').getByText('Lifecycle bowl', { exact: true }).click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect.poll(async () => {
    return page.evaluate(() => {
      const moments = JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]');
      return moments.some((moment: { id: string }) => moment.id === 'lifecycle-1');
    });
  }).toBe(false);

  await page.reload();
  await openMoments(page);
  await expect(page.getByText('Lifecycle bowl', { exact: true })).toHaveCount(0);
});
