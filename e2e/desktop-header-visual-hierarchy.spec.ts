import { test, expect, type Page } from '@playwright/test';

const profile = {
  summary: 'I want to understand my rhythm.',
  priorities: [],
  preferences: [],
  rawIntro: 'I want to understand my rhythm.',
  confirmedAt: Date.now(),
  firstPlan: {
    title: 'Observe your rhythm',
    rationale: 'Notice what repeats.',
    focusAreas: [],
    firstStep: 'Capture your next meal.',
    phase: 'midday',
  },
};

async function seedReturningGuest(page: Page) {
  await page.addInitScript((introProfile) => {
    localStorage.setItem('rhythm_language_v1', 'ar');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify(introProfile));
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  }, profile);
}

test.describe('Rhythm desktop navigation visual hierarchy', () => {
  test('desktop navigation has room for Arabic labels and a prominent capture action', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await seedReturningGuest(page);
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
    await expect(header.locator(':scope > div').first()).toHaveCSS('height', '80px');
  });

  test('mobile retains its dedicated navigation without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await seedReturningGuest(page);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('header').first()).toBeHidden();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
  });
});
