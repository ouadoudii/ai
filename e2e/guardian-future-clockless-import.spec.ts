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
  test(`P0 Guardian ignores future clockless imports but keeps observed meals on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    // Install the browser clock before seeding: Date and the Guardian evaluation must agree.
    await page.clock.install({ time: new Date('2026-11-02T15:00:00Z') });
    await page.addInitScript(({ profile }) => {
      // Explicit fixture timestamps avoid init-script scheduling skew on CI runners.
      const date = '2026-11-02';
      const observedAt = Date.parse('2026-11-02T15:00:00Z');
      const base = {
        date, label: 'غداء', category: 'lunch', location: 'البيت',
        locationCategory: 'home', imageUrl: '', tags: [],
        eatingPace: 'rushed', distraction: 'screen',
      };
      localStorage.setItem('rhythm_language_v1', 'ar');
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
      localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify(profile));
      localStorage.setItem('nimmapp_moments_v1', JSON.stringify([
        { ...base, id: 'future-meal', title: 'وجبة مستقبلية', createdAt: observedAt + 300_000 },
        { ...base, id: 'past-harira', title: 'حريرة 7rira', createdAt: observedAt - 60_000 },
      ]));
      localStorage.setItem('nimmapp_checkins_v1', JSON.stringify([
        { id: 'future-sleep', date, timeOfDay: 'midday',
          sleep: { durationHours: 5, quality: 2, wakeFeeling: 'exhausted' },
          wellbeing: { energyLevel: 1 }, createdAt: observedAt + 300_000 },
        { id: 'past-rested', date, timeOfDay: 'morning',
          sleep: { durationHours: 8, quality: 4, wakeFeeling: 'refreshed' },
          wellbeing: { energyLevel: 4 }, createdAt: observedAt - 60_000 },
      ]));
      localStorage.removeItem('moment.guardian.acknowledged-occurrences.v1');
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    }, { profile });
    await page.goto('/');
    // Fail clearly if the browser clock/fixture day diverges before checking Guardian.
    expect(await page.evaluate(() => new Date().toISOString())).toBe('2026-11-02T15:00:00.000Z');
    expect(await page.evaluate(() => Date.now())).toBe(Date.parse('2026-11-02T15:00:00Z'));
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]').map((item: { id: string }) => item.id)))
      .toEqual(['future-meal', 'past-harira']);
    const before = await page.evaluate(() => [
      localStorage.getItem('nimmapp_moments_v1'),
      localStorage.getItem('nimmapp_checkins_v1'),
    ]);
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    const guardian = page.getByTestId('guardian');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(guardian.getByText('لحظة هدوء بعد وجبتك')).toBeVisible();
    await expect(guardian).toContainText('حريرة 7rira');
    await expect(guardian).not.toContainText('وجبة مستقبلية');
    await expect(guardian.getByText('قد تحتاج إلى بعض الراحة اليوم')).toHaveCount(0);
    await expect(guardian.getByText('مساحة صغيرة لاستعادة نشاطك')).toHaveCount(0);
    await expect(guardian.getByRole('status')).toContainText('أفكار يمكنك تجاهلها');
    await expect(guardian).not.toContainText(/فشل|عقاب|إنذار|Ghrelin|28%|Überessen|Küchenschluss/);
    await expect(guardian.locator('.animate-pulse, .animate-ping, [class*="bg-red"], [class*="bg-rose"]')).toHaveCount(0);
    expect(await page.evaluate(() => [
      localStorage.getItem('nimmapp_moments_v1'),
      localStorage.getItem('nimmapp_checkins_v1'),
    ])).toEqual(before);
  });
}
