import { expect, test } from '@playwright/test';

const profile = {
  summary: 'Rhythm', priorities: [], preferences: [], rawIntro: 'Rhythm',
  confirmedAt: 1,
  firstPlan: { title: 'Observe', rationale: 'Notice', focusAreas: [], firstStep: 'Capture', phase: 'midday' },
};
const acknowledgementKey = 'moment.guardian.acknowledged-occurrences.v1';

for (const viewport of [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test(`Guardian dismissals sync across real browser tabs without losing private history on ${viewport.name}`, async ({ page, context }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.addInitScript(({ profile }) => {
      const now = new Date();
      const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
      localStorage.setItem('rhythm_language_v1', 'ar');
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
      localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify(profile));
      localStorage.setItem('nimmapp_checkins_v1', JSON.stringify([{
        id: 'real-sleep-two-tabs', date, time: '06:00', timeOfDay: 'morning',
        sleep: { durationHours: 4.5, quality: 2, wakeFeeling: 'exhausted' },
        wellbeing: { energyLevel: 4 }, createdAt: Date.now() - 1000,
      }]));
      localStorage.setItem('nimmapp_moments_v1', JSON.stringify([{
        id: 'real-meal-two-tabs', date, time: '06:45', title: 'حريرة',
        label: 'فطور', category: 'breakfast', location: 'البيت', locationCategory: 'home',
        imageUrl: '', rating: 3, hungerLevel: 4, fullnessLevel: 4,
        eatingPace: 'rushed', distraction: 'screen', energyAfter: 'steady',
        notes: '', tags: [], createdAt: Date.now() - 500,
      }]));
      localStorage.removeItem('moment.guardian.acknowledged-occurrences.v1');
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    }, { profile });

    await page.goto('/');
    const nav = viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav';
    await page.getByTestId(nav).click();
    const firstGuardian = page.getByTestId('guardian');
    await expect(firstGuardian.getByRole('button', { name: /إخفاء الفكرة/ })).toHaveCount(2);

    const otherTab = await context.newPage();
    try {
      await otherTab.setViewportSize({ width: viewport.width, height: viewport.height });
      await otherTab.addInitScript(() => sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true'));
      await otherTab.goto('/');
      await otherTab.getByTestId(nav).click();
      const secondGuardian = otherTab.getByTestId('guardian');
      await expect(secondGuardian.getByRole('button', { name: /إخفاء الفكرة/ })).toHaveCount(2);

      const originalJournal = await page.evaluate(() => ({
        meals: localStorage.getItem('nimmapp_moments_v1'),
        checkIns: localStorage.getItem('nimmapp_checkins_v1'),
      }));
      await firstGuardian.getByRole('button', { name: /إخفاء الفكرة: قد تحتاج إلى بعض الراحة اليوم/ }).click();
      await expect(secondGuardian.getByRole('button', { name: /إخفاء الفكرة/ })).toHaveCount(1);
      await secondGuardian.getByRole('button', { name: /إخفاء الفكرة: لحظة هدوء بعد وجبتك/ }).click();
      await expect(firstGuardian.getByRole('button', { name: /إخفاء الفكرة/ })).toHaveCount(0);
      await expect(firstGuardian.getByRole('status')).toContainText('خذ يومك على مهل');
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      await expect(otherTab.locator('html')).toHaveAttribute('dir', 'rtl');

      const stored = await page.evaluate((key) => ({
        ids: JSON.parse(localStorage.getItem(key) || '[]') as string[],
        meals: localStorage.getItem('nimmapp_moments_v1'),
        checkIns: localStorage.getItem('nimmapp_checkins_v1'),
      }), acknowledgementKey);
      expect(stored.ids).toHaveLength(2);
      expect(stored.ids).toContain('alarm-sleep-real-sleep-two-tabs');
      expect(stored.ids).toContain('alarm-mindless-real-meal-two-tabs');
      expect(stored.meals).toBe(originalJournal.meals);
      expect(stored.checkIns).toBe(originalJournal.checkIns);
      await expect(firstGuardian).not.toContainText(/فشل|عقاب|Ghrelin|28%/);
      await expect(firstGuardian.locator('.animate-pulse, .animate-ping, [class*="bg-red"]')).toHaveCount(0);
    } finally {
      await otherTab.close();
    }
  });
}
