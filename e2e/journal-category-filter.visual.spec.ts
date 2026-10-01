import { test, expect } from '@playwright/test';

for (const viewport of [{ name: 'desktop', width: 1280, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
  test(`journal category filter is visible and interactive on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');

    const timeline = page.getByTestId('moments-timeline');
    await expect(timeline).toBeVisible();
    await expect(page.getByTestId('timeline-category-filters')).toBeVisible();

    const breakfast = page.getByTestId('timeline-category-breakfast');
    await expect(breakfast).toBeVisible();
    await breakfast.click();
    await expect(breakfast).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('timeline-category-all')).toHaveAttribute('aria-pressed', 'false');

    await page.screenshot({ path: `test-results/journal-category-filter-${viewport.name}.png`, fullPage: true });
  });
}
