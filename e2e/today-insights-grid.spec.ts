import { test, expect } from '@playwright/test';

test('desktop insights form two readable columns below the voice action', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
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
  await page.goto('/');
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
