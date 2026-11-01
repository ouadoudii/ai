import { expect, test } from '@playwright/test';

const profile = {
  summary: 'أريد متابعة يومي بهدوء', priorities: [], preferences: [],
  rawIntro: 'أريد متابعة يومي بهدوء', confirmedAt: 1,
  firstPlan: { title: 'يومي', rationale: 'لاحظ ما يناسبك', focusAreas: [], firstStep: 'دوّن ما ترغب', phase: 'midday' },
};

for (const viewport of [{ name: 'desktop', width: 1280, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
  test(`Guardian handles imported check-ins without time on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.addInitScript((profile) => {
      const now = new Date();
      const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
      localStorage.setItem('rhythm_language_v1', 'ar');
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
      localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify(profile));
      localStorage.setItem('nimmapp_moments_v1', '[]');
      localStorage.setItem('nimmapp_checkins_v1', JSON.stringify([
        { id: 'legacy-sleep-a', date: today, timeOfDay: 'morning', createdAt: 1, sleep: { durationHours: 5, wakeFeeling: 'tired' } },
        { id: 'legacy-sleep-b', date: today, timeOfDay: 'morning', createdAt: 1, sleep: { durationHours: 5, wakeFeeling: 'refreshed' } },
      ]));
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    }, profile);
    await page.goto('/');
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    const guardian = page.getByTestId('guardian');
    await expect(guardian).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(guardian).toContainText('قد تحتاج إلى بعض الراحة اليوم');
    await expect(guardian).not.toContainText(/undefined|NaN|Ghrelin|28%|فشل|عقاب/);
    await expect(guardian.locator('.animate-pulse, .animate-ping, [class*="bg-red"], [class*="bg-rose"]')).toHaveCount(0);
  });

  test(`Guardian ignores impossible imported clock values on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.addInitScript((profile) => {
      const now = new Date();
      const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
      localStorage.setItem('rhythm_language_v1', 'ar');
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
      localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify(profile));
      localStorage.setItem('nimmapp_moments_v1', '[]');
      localStorage.setItem('nimmapp_checkins_v1', JSON.stringify([
        { id: 'invalid-time-low', date: today, time: '99:99', timeOfDay: 'morning', createdAt: 1, sleep: { durationHours: 5, wakeFeeling: 'tired' } },
        { id: 'valid-time-recovered', date: today, time: '10:30', timeOfDay: 'morning', createdAt: 1, sleep: { durationHours: 8, wakeFeeling: 'refreshed' } },
      ]));
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    }, profile);
    await page.goto('/');
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    const guardian = page.getByTestId('guardian');
    await expect(guardian).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(guardian).toContainText('لكل يوم إيقاعه الخاص. نحن هنا لنرافقك بلطف متى احتجت.');
    await expect(guardian).not.toContainText(/قد تحتاج إلى بعض الراحة اليوم|undefined|NaN|Ghrelin|28%|فشل|عقاب/);
    await expect(guardian.locator('.animate-pulse, .animate-ping, [class*="bg-red"], [class*="bg-rose"]')).toHaveCount(0);
  });
  test(`Guardian ignores impossible imported meal clocks on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.addInitScript((profile) => {
      const now = new Date();
      const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
      localStorage.setItem('rhythm_language_v1', 'ar');
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
      localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify(profile));
      localStorage.setItem('nimmapp_moments_v1', JSON.stringify([
        { id: 'invalid-clock-rushed', title: 'حريرة', label: 'غداء', category: 'lunch',
          date: today, time: '99:99', createdAt: 300, location: 'الرباط',
          locationCategory: 'home', imageUrl: '', mood: 'comfort', tags: ['Darija'],
          eatingPace: 'rushed', distraction: 'screen' },
        { id: 'valid-clock-calm', title: 'كسكس', label: 'غداء', category: 'lunch',
          date: today, time: '14:00', createdAt: 100, location: 'الرباط',
          locationCategory: 'home', imageUrl: '', mood: 'comfort', tags: ['Darija'],
          eatingPace: 'slow', distraction: 'mindful' },
      ]));
      localStorage.setItem('nimmapp_checkins_v1', '[]');
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    }, profile);
    await page.goto('/');
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    const guardian = page.getByTestId('guardian');
    await expect(guardian).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(guardian).toContainText('هنا متى احتجت');
    await expect(guardian).not.toContainText(/99:99|لحظة هدوء بعد وجبتك|Ghrelin|28%|فشل|عقاب|إنذار/);
    await expect(guardian.locator('.animate-pulse, .animate-ping, [class*="bg-red"], [class*="bg-rose"]')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() =>
      JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]').map((entry: { id: string }) => entry.id)
    )).toEqual(['invalid-clock-rushed', 'valid-clock-calm']);
  });


  test(`Guardian calmly ignores impossible imported sleep metrics on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.addInitScript((profile) => {
      const now = new Date();
      const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
      localStorage.setItem('rhythm_language_v1', 'ar');
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
      localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify(profile));
      localStorage.setItem('nimmapp_moments_v1', '[]');
      localStorage.setItem('nimmapp_checkins_v1', JSON.stringify([
        { id: 'impossible-sleep', date: today, time: '07:00', timeOfDay: 'morning',
          createdAt: 100, sleep: { durationHours: -3, quality: 99, wakeFeeling: 'unknown' } },
      ]));
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    }, profile);
    await page.goto('/');
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    const guardian = page.getByTestId('guardian');
    await expect(guardian).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(guardian).toContainText('هنا متى احتجت');
    await expect(guardian).not.toContainText(/قد تحتاج إلى بعض الراحة اليوم|-3 ساعات|99 من 5|undefined|NaN|فشل|عقاب|Ghrelin|28%/);
    await expect(guardian.locator('.animate-pulse, .animate-ping, [class*="bg-red"], [class*="bg-rose"]')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('nimmapp_checkins_v1') || '[]')[0]?.sleep)).toEqual({
      durationHours: -3, quality: 99, wakeFeeling: 'unknown',
    });
  });

  for (const scenario of ['invalid-only', 'valid-low-before-invalid'] as const) {
    test(`Guardian ignores invalid energy scores (${scenario}) on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.clock.install({ time: new Date('2026-11-01T15:00:00') });
      await page.addInitScript(({ profile, scenario }) => {
        const now = new Date();
        const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
        localStorage.setItem('rhythm_language_v1', 'ar');
        localStorage.setItem('cary_access_mode_v1', 'guest');
        localStorage.setItem('cary_onboarding_v2_complete', 'true');
        localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
        localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify(profile));
        localStorage.setItem('nimmapp_moments_v1', '[]');
        localStorage.setItem('nimmapp_checkins_v1', JSON.stringify([
          ...(scenario === 'valid-low-before-invalid'
            ? [{ id: 'valid-low-energy', date: today, time: '14:00', timeOfDay: 'midday',
              createdAt: 100, wellbeing: { energyLevel: 1 } }] : []),
          { id: 'invalid-later-energy', date: today, time: '14:30', timeOfDay: 'midday',
            createdAt: 200, wellbeing: { energyLevel: 99 } },
          { id: 'invalid-negative-energy', date: today, time: '14:40', timeOfDay: 'midday',
            createdAt: 300, wellbeing: { energyLevel: -3 } },
          { id: 'invalid-fractional-energy', date: today, time: '14:45', timeOfDay: 'midday',
            createdAt: 400, wellbeing: { energyLevel: 1.5 } },
        ]));
        sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
      }, { profile, scenario });
      await page.goto('/');
      // Verify the real afternoon clock and the seeded local day before checking guidance.
      // This guards against browser clock drift and false negatives in cross-timezone CI.
      expect(await page.evaluate(() => new Date().getHours())).toBe(15);
      const seeded = await page.evaluate(() => ({
        today: new Date().toLocaleDateString('en-CA'),
        checkIns: JSON.parse(localStorage.getItem('nimmapp_checkins_v1') || '[]'),
      }));
      expect(seeded.checkIns).toHaveLength(scenario === 'valid-low-before-invalid' ? 4 : 3);
      expect(seeded.checkIns.every((entry: { date: string; timeOfDay: string }) =>
        entry.date === seeded.checkIns[0].date && entry.timeOfDay === 'midday')).toBe(true);
      const before = await page.evaluate(() => localStorage.getItem('nimmapp_checkins_v1'));
      await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
      const guardian = page.getByTestId('guardian');
      await expect(guardian).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      if (scenario === 'valid-low-before-invalid') {
        await expect(guardian).toContainText('مساحة صغيرة لاستعادة نشاطك');
      } else {
        await expect(guardian).not.toContainText('مساحة صغيرة لاستعادة نشاطك');
        await expect(guardian).toContainText('هنا متى احتجت');
      }
      await expect(guardian).not.toContainText(/99|\-3|undefined|NaN|Ghrelin|28%|فشل|عقاب|إنذار/);
      await expect(guardian.locator('.animate-pulse, .animate-ping, [class*="bg-red"], [class*="bg-rose"]')).toHaveCount(0);
      expect(await page.evaluate(() => localStorage.getItem('nimmapp_checkins_v1'))).toBe(before);
    });
  }
}
