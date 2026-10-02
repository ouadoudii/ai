import { expect, test } from '@playwright/test';

const meal = {
  id: 'moment-pinned-e2e',
  title: 'بيض مسلوق',
  category: 'breakfast',
  date: '2026-10-02',
  time: '08:15',
  location: 'Home',
  imageUrl: '',
  rating: 5,
  mood: 'satisfied',
  tags: [],
  createdAt: 1790928900000,
};

async function seedMeal(page: import('@playwright/test').Page) {
  await page.addInitScript((seed) => {
    localStorage.setItem('nimmapp_moments_v1', JSON.stringify([seed]));
    localStorage.removeItem('moment_pinned_meals_v1');
  }, meal);
}

async function exercisePinFlow(page: import('@playwright/test').Page, mobile: boolean) {
  await seedMeal(page);
  await page.goto('/');
  if (mobile) {
    await page.getByTestId('mobile-moments-nav').click();
  } else {
    await page.getByRole('button', { name: /entries/i }).click();
  }
  await page.getByTestId(`timeline-moment-${meal.id}`).click();
  const pin = page.getByTestId('pin-meal-button');
  await expect(pin).toBeVisible();
  await expect(pin).toHaveAttribute('aria-pressed', 'false');
  await pin.click();
  await expect(pin).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('moment_pinned_meals_v1'))).toBe(JSON.stringify([meal.id]));
  await page.screenshot({ path: `visual-artifacts/pinned-meal-${mobile ? 'mobile' : 'desktop'}.png`, fullPage: true });

  await page.reload();
  if (mobile) await page.getByTestId('mobile-moments-nav').click();
  else await page.getByRole('button', { name: /entries/i }).click();
  await page.getByTestId(`timeline-moment-${meal.id}`).click();
  await expect(page.getByTestId('pin-meal-button')).toHaveAttribute('aria-pressed', 'true');
}

test('pins a meal and keeps it pinned after reload on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await exercisePinFlow(page, false);
});

test('pins a meal and keeps it pinned after reload on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await exercisePinFlow(page, true);
});
