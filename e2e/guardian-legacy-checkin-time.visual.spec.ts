import { expect, test } from '@playwright/test';

// These scenarios need a real 15:00 browser-local clock. The shared E2E
// timezone intentionally shifts with CI start time and must not change it.
test.use({ timezoneId: 'UTC' });

const profile = {
  summary: 'أريد متابعة يومي بهدوء', priorities: [], preferences: [],
  rawIntro: 'أريد متابعة يومي بهدوء', confirmedAt: 1,
  firstPlan: { title: 'يومي', rationale: 'لاحظ ما يناسبك', focusAreas: [], firstStep: 'دوّن ما ترغب', phase: 'midday' },
};

for (const viewport of [{ name: 'desktop', width: 1280, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
  test(`Guardian handles imported check-ins without time on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    // The imported morning observations must be in the past regardless of CI start time.
    await page.clock.setFixedTime(new Date('2026-11-02T15:00:00Z'));
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
    // The imported morning observations must be in the past regardless of CI start time.
    await page.clock.setFixedTime(new Date('2026-11-02T15:00:00Z'));
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
    // A 14:00 observation must be evaluated after 14:00, not at the CI runner's current hour.
    const afternoon = new Date();
    afternoon.setUTCHours(15, 0, 0, 0);
    await page.clock.setFixedTime(afternoon);
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


  test(`Guardian preserves usable sleep despite newer corrupt import on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.clock.install({ time: new Date('2026-11-01T10:00:00Z') });
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
        { id: 'valid-sleep-earlier', date: today, time: '07:30', timeOfDay: 'morning',
          createdAt: 100, sleep: { durationHours: 5, quality: 2, wakeFeeling: 'tired' } },
        { id: 'corrupt-sleep-later', date: today, time: '08:30', timeOfDay: 'morning',
          createdAt: 200, sleep: { durationHours: -3, quality: 99, wakeFeeling: 'unknown' } },
      ]));
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    }, profile);
    await page.goto('/');
    const before = await page.evaluate(() => localStorage.getItem('nimmapp_checkins_v1'));
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    const guardian = page.getByTestId('guardian');
    await expect(guardian).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(guardian).toContainText('قد تحتاج إلى بعض الراحة اليوم');
    await expect(guardian).toContainText('سجّلت 5 ساعات نوم');
    await expect(guardian).not.toContainText(/-3 ساعات|99 من 5|undefined|NaN|Ghrelin|28%|فشل|عقاب|إنذار/);
    await expect(guardian.locator('.animate-pulse, .animate-ping, [class*="bg-red"], [class*="bg-rose"]')).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('nimmapp_checkins_v1'))).toBe(before);
  });

  test(`Guardian respects a later valid rested feeling with corrupt sleep metrics on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.clock.install({ time: new Date('2026-11-01T10:00:00Z') });
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
        { id: 'earlier-tired', date: today, time: '07:30', timeOfDay: 'morning',
          createdAt: 100, sleep: { durationHours: 5, quality: 2, wakeFeeling: 'tired' } },
        { id: 'later-rested', date: today, time: '08:30', timeOfDay: 'morning',
          createdAt: 200, sleep: { durationHours: -3, quality: 99, wakeFeeling: 'refreshed' } },
      ]));
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    }, profile);
    await page.goto('/');
    const before = await page.evaluate(() => localStorage.getItem('nimmapp_checkins_v1'));
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    const guardian = page.getByTestId('guardian');
    await expect(guardian).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(guardian).toContainText('هنا متى احتجت');
    await expect(guardian).not.toContainText(/قد تحتاج إلى بعض الراحة اليوم|-3 ساعات|99 من 5|undefined|NaN|Ghrelin|28%|فشل|عقاب|إنذار/);
    await expect(guardian.locator('.animate-pulse, .animate-ping, [class*="bg-red"], [class*="bg-rose"]')).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('nimmapp_checkins_v1'))).toBe(before);
  });

  for (const scenario of ['invalid-only', 'valid-low-before-invalid'] as const) {
    test(`Guardian ignores invalid energy scores (${scenario}) on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.clock.install({ time: new Date('2026-11-01T15:00:00Z') });
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
        today: [new Date().getFullYear(), String(new Date().getMonth() + 1).padStart(2, '0'), String(new Date().getDate()).padStart(2, '0')].join('-'),
        checkIns: JSON.parse(localStorage.getItem('nimmapp_checkins_v1') || '[]'),
      }));
      expect(seeded.checkIns).toHaveLength(scenario === 'valid-low-before-invalid' ? 4 : 3);
      expect(seeded.checkIns.every((entry: { date: string; timeOfDay: string }) =>
        entry.date === seeded.today && entry.timeOfDay === 'midday')).toBe(true);
      expect(seeded.checkIns[0]?.wellbeing?.energyLevel).toBe(scenario === 'valid-low-before-invalid' ? 1 : 99);
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

  test(`Guardian honors later recovered check-ins despite reverse import timestamps on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.clock.install({ time: new Date('2026-11-01T15:00:00Z') });
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
        { id: 'backfilled-short-sleep', date: today, time: '07:00', timeOfDay: 'morning',
          createdAt: 900, sleep: { durationHours: 5, quality: 2, wakeFeeling: 'tired' } },
        { id: 'rested-later', date: today, time: '08:30', timeOfDay: 'morning',
          createdAt: 100, sleep: { durationHours: 8, quality: 4, wakeFeeling: 'refreshed' } },
        { id: 'backfilled-low-energy', date: today, time: '14:00', timeOfDay: 'midday',
          createdAt: 800, wellbeing: { energyLevel: 1 } },
        { id: 'energy-recovered-later', date: today, time: '14:30', timeOfDay: 'midday',
          createdAt: 200, wellbeing: { energyLevel: 4 } },
      ]));
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    }, profile);
    await page.goto('/');
    expect(await page.evaluate(() => new Date().getHours())).toBe(15);
    const before = await page.evaluate(() => localStorage.getItem('nimmapp_checkins_v1'));
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    const guardian = page.getByTestId('guardian');
    await expect(guardian).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(guardian).toContainText('هنا متى احتجت');
    await expect(guardian).not.toContainText(/قد تحتاج إلى بعض الراحة اليوم|مساحة صغيرة لاستعادة نشاطك|فشل|عقاب|إنذار|Ghrelin|28%/);
    await expect(guardian.locator('.animate-pulse, .animate-ping, [class*="bg-red"], [class*="bg-rose"]')).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('nimmapp_checkins_v1'))).toBe(before);
  });

}
