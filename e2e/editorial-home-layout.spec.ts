import { test, expect } from '@playwright/test';

async function openArabicToday(page: import('@playwright/test').Page) {
  // Exercise the real Today screen after completing the existing guest gate.
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'ar');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });
  await page.goto('/');
  await expect(page.getByTestId('today-organic-hero')).toBeVisible();
}

test('Arabic editorial home keeps its primary voice action on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openArabicToday(page);
  const hero = page.getByTestId('today-organic-hero');
  await expect(hero).toBeVisible();
  await expect(hero.getByTestId('voice-home-mic')).toBeVisible();
  await expect(hero).toHaveCSS('border-top-left-radius', '48px');
  await expect(hero.getByTestId('voice-home-mic')).toHaveCSS('min-height', '200px');
});

test('Arabic editorial home remains usable at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openArabicToday(page);
  await expect(page.getByTestId('today-organic-hero').getByTestId('voice-home-mic')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
