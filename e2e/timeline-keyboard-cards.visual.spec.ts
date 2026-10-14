import { test, expect } from '@playwright/test';

const moment = {
  id: 'keyboard-meal',
  title: 'بيض مسلوق',
  category: 'breakfast',
  date: '2026-09-30',
  time: '08:15',
  location: 'Home',
  locationCategory: 'home',
  mood: 'satisfied',
  rating: 4,
  tags: [],
  createdAt: '2026-09-30T08:15:00.000Z'
};

test.describe('timeline meal keyboard access', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((seed) => {
      localStorage.setItem('nimmapp_moments_v1', JSON.stringify([seed]));
      localStorage.setItem('rhythm_language_v1', 'en');
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
      localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify({ confirmedAt: Date.now() }));
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    }, moment);
    await page.goto('/');
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]').some((entry: { id?: string }) => entry.id === 'keyboard-meal'))).toBe(true);
    const desktopTimeline = page.getByRole('button', { name: /entries/i }).first();
    const mobileTimeline = page.getByTestId('mobile-moments-nav');
    if (await desktopTimeline.isVisible().catch(() => false)) await desktopTimeline.click();
    else await mobileTimeline.click();
    await expect(page.getByTestId('moments-timeline')).toBeVisible();
  });

  test('meal row is a native button and Enter opens detail', async ({ page }) => {
    const card = page.getByTestId('timeline-moment-keyboard-meal');
    await expect(card).toBeVisible();
    await expect(card).toHaveJSProperty('tagName', 'BUTTON');
    await card.focus();
    await expect(card).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByText('بيض مسلوق').last()).toBeVisible();
    await page.screenshot({ path: 'test-results/timeline-keyboard-enter.png', fullPage: true });
  });

  test('Space activates the focused meal row', async ({ page }) => {
    const card = page.getByTestId('timeline-moment-keyboard-meal');
    await expect(card).toBeVisible();
    await card.focus();
    await expect(card).toBeFocused();
    await page.keyboard.press('Space');
    await expect(page.getByText('بيض مسلوق').last()).toBeVisible();
  });
});
