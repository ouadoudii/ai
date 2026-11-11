import { test, expect } from '@playwright/test';

test.describe('Rhythm desktop navigation visual hierarchy', () => {
  test('desktop navigation has room for Arabic labels and a prominent capture action', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
    await expect(header.getByRole('navigation')).toBeVisible();
    const capture = header.getByTestId('desktop-capture-button');
    await expect(capture).toBeVisible();
    const box = await capture.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(75);
    const nav = await header.getByRole('navigation').boundingBox();
    expect(nav).not.toBeNull();
    expect(nav!.x).toBeGreaterThanOrEqual(0);
    expect(nav!.x + nav!.width).toBeLessThanOrEqual(1440);
    await expect(header).toHaveCSS('height', '80px');
  });

  test('mobile retains its dedicated navigation without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('header').first()).toBeHidden();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
  });
});
