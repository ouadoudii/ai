import { test, expect } from '@playwright/test';

async function openArabicToday(page: import('@playwright/test').Page) {
  // Exercise the Today layout after the existing guest gate; separate tests cover the gate itself.
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'ar');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });
  await page.goto('/');
  await expect(page.getByTestId('today-organic-hero')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', /^ar(?:-|$)/);
}

test('desktop insights form two readable columns below the voice action', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openArabicToday(page);
  await expect(page.getByTestId('voice-home-mic')).toBeVisible();
  const grid = page.getByTestId('today-insights-grid');
  await expect(grid).toBeVisible();
  const cells = grid.locator(':scope > div');
  await expect(cells).toHaveCount(4);
  const first = await cells.nth(0).boundingBox();
  const second = await cells.nth(1).boundingBox();
  expect(first).not.toBeNull();
  expect(second).not.toBeNull();
  expect(Math.abs(first!.y - second!.y)).toBeLessThan(3);
  expect(Math.abs(first!.x - second!.x)).toBeGreaterThan(100);
});

test('mobile insights remain stacked with no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openArabicToday(page);
  const grid = page.getByTestId('today-insights-grid');
  await expect(grid).toBeVisible();
  const cells = grid.locator(':scope > div');
  const first = await cells.nth(0).boundingBox();
  const second = await cells.nth(1).boundingBox();
  expect(first).not.toBeNull();
  expect(second).not.toBeNull();
  expect(second!.y).toBeGreaterThan(first!.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
