import { expect, test } from '@playwright/test';

async function openMoments(page: import('@playwright/test').Page) {
  const momentsNav = page.getByTestId('mobile-moments-nav');
  await momentsNav.click();
  await expect(momentsNav).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('heading', { name: 'Journal & timeline' })).toBeVisible();
}

test('moment lifecycle persists favorite and deletion across reloads', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'en');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_intro_profile_v1', '{}');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (text: string) => { localStorage.setItem('e2e_clipboard_text', text); } },
    });
    if (localStorage.getItem('nimmapp_moments_v1') === null) {
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
    }
  });

  await page.goto('/');
  await openMoments(page);
  await expect(page.getByTestId('moments-timeline')).toContainText('Lifecycle bowl');

  await page.getByTestId('moments-timeline').getByText('Lifecycle bowl', { exact: true }).click();
  await expect(page.locator('h1', { hasText: 'Lifecycle bowl' })).toBeVisible();

  await page.getByRole('button', { name: 'Share' }).click();
  await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('e2e_clipboard_text'))).toContain('Lifecycle bowl');

  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => { throw new Error('denied'); } },
    });
  });
  await page.getByRole('button', { name: 'Copied' }).click();
  await expect(page.getByRole('button', { name: 'Copy failed' })).toBeVisible();

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
  page.once('dialog', async dialog => {
    expect(dialog.type()).toBe('confirm');
    expect(dialog.message()).toContain('Lifecycle bowl');
    expect(dialog.message()).toContain('cannot be undone');
    await dialog.accept();
  });
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
