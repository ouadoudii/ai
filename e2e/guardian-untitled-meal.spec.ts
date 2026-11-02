import { expect, test } from '@playwright/test';

test.use({ timezoneId: 'UTC' });

const profile = {
  summary: 'Rhythm', priorities: [], preferences: [], rawIntro: 'Rhythm',
  confirmedAt: 1,
  firstPlan: { title: 'Observe', rationale: 'Notice', focusAreas: [], firstStep: 'Capture', phase: 'midday' },
};

for (const viewport of [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  for (const mealTitle of ['', 'حريرة 7rira']) {
    test(`P0 Guardian keeps untitled/mixed-script meal guidance respectful on ${viewport.name} (${mealTitle || 'untitled'})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.clock.setFixedTime(new Date('2026-11-02T15:00:00Z'));
      await page.addInitScript(({ profile, mealTitle }) => {
        const now = new Date();
        const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
        localStorage.setItem('rhythm_language_v1', 'ar');
        localStorage.setItem('cary_access_mode_v1', 'guest');
        localStorage.setItem('cary_onboarding_v2_complete', 'true');
        localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
        localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify(profile));
        localStorage.setItem('nimmapp_checkins_v1', '[]');
        localStorage.setItem('nimmapp_moments_v1', JSON.stringify([{
          id: 'imported-untitled', title: mealTitle, label: 'غداء', category: 'lunch',
          date, time: '12:30', location: 'البيت', locationCategory: 'home',
          imageUrl: '', tags: [], eatingPace: 'rushed', distraction: 'screen',
          createdAt: Date.now(),
        }]));
        localStorage.removeItem('moment.guardian.acknowledged-occurrences.v1');
        sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
      }, { profile, mealTitle });
      await page.goto('/');
      const before = await page.evaluate(() => localStorage.getItem('nimmapp_moments_v1'));
      await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
      const guardian = page.getByTestId('guardian');
      await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      await expect(guardian.getByText(mealTitle
        ? 'تناولت «حريرة 7rira» بينما كان انتباهك مشغولًا'
        : 'تناولت وجبتك بينما كان انتباهك مشغولًا')).toBeVisible();
      await expect(guardian.getByRole('button', { name: /إخفاء الفكرة/ })).toHaveCount(1);
      await expect(guardian).not.toContainText(/undefined|\[object Object\]|فشل|عقاب|إنذار|Ghrelin|28%/);
      await expect(guardian.locator('.animate-pulse, .animate-ping, [class*="bg-red"], [class*="bg-rose"]')).toHaveCount(0);
      expect(await page.evaluate(() => localStorage.getItem('nimmapp_moments_v1'))).toBe(before);
    });
  }
}
