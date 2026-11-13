import { test, expect } from '@playwright/test';

test('Arabic editorial home keeps its primary voice action on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const hero = page.getByTestId('today-organic-hero');
  await expect(hero).toBeVisible();
  await expect(hero.getByTestId('voice-home-mic')).toBeVisible();
  await expect(hero).toHaveCSS('border-top-left-radius', '48px');
  await expect(hero.getByTestId('voice-home-mic')).toHaveCSS('min-height', '200px');
});

test('Arabic editorial home remains usable at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByTestId('today-organic-hero').getByTestId('voice-home-mic')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
