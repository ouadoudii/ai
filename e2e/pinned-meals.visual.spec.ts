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
    localStorage.setItem('rhythm_language_v1', 'de');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('nimmapp_moments_v1', JSON.stringify([seed]));
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    // Preserve pinned meal state across navigation and page reloads.
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  }, meal);
}

async function openTimeline(page: import('@playwright/test').Page, mobile: boolean) {
  if (mobile) await page.getByTestId('mobile-moments-nav').click();
  else await page.getByRole('button', { name: 'لحظات', exact: true }).click();
}

async function exercisePinFlow(page: import('@playwright/test').Page, mobile: boolean, screenshotPath: string) {
  await seedMeal(page);
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  expect(await page.evaluate(() => localStorage.getItem('rhythm_language_v1'))).toBe('de');
  await openTimeline(page, mobile);
  await page.getByTestId(`timeline-moment-${meal.id}`).click();
  const pin = page.getByTestId('pin-meal-button');
  await expect(pin).toBeVisible();
  await expect(pin).toHaveAttribute('aria-pressed', 'false');
  await pin.click();
  await expect(pin).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('moment_pinned_meals_v1'))).toBe(JSON.stringify([meal.id]));

  await page.reload();
  await openTimeline(page, mobile);
  await page.getByTestId(`timeline-moment-${meal.id}`).click();
  await expect(page.getByTestId('pin-meal-button')).toHaveAttribute('aria-pressed', 'true');

  await page.goto('/');
  const shortcuts = page.getByTestId('pinned-meals-shortcuts');
  await expect(shortcuts).toBeVisible();
  await expect(shortcuts).toContainText('الوجبات المثبّتة');
  await expect(shortcuts).toContainText(meal.title);
  const repeat = page.getByTestId(`repeat-pinned-meal-${meal.id}`);
  await expect(repeat).toHaveAccessibleName(`استخدمها مجدداً · ${meal.title}`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await repeat.click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]').length)).toBe(2);
  const repeated = await page.evaluate(() => JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]')[0]);
  expect(repeated.title).toBe(meal.title);
  expect(repeated.category).toBe(meal.category);
  expect(repeated.id).not.toBe(meal.id);
  expect(repeated.tags).toEqual(['Repeated']);
  expect(repeated.notes).toBeUndefined();
  expect(repeated.rating).toBeUndefined();
  expect(repeated.location).toBe('');
}

for (const viewport of [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test(`pins and safely reuses a meal after reload on ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await exercisePinFlow(page, viewport.name === 'mobile', testInfo.outputPath(`pinned-meal-${viewport.name}.png`));
  });
}
