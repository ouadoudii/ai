import { expect, test } from '@playwright/test';

// A Coach tab left open must not keep a stale afternoon suggestion after
// the local hour changes. Browser time and seeded records use the same zone.
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
  test(`P0 Guardian refreshes gentle Arabic energy guidance across local hour boundaries on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.clock.install({ time: new Date('2026-11-02T12:59:00Z') });
    await page.addInitScript((savedProfile) => {
      const now = new Date();
      const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
      localStorage.setItem('rhythm_language_v1', 'ar');
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
      localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify(savedProfile));
      localStorage.setItem('nimmapp_moments_v1', '[]');
      localStorage.setItem('nimmapp_checkins_v1', JSON.stringify([{
        id: 'observed-low-energy', date, time: '12:00', timeOfDay: 'midday',
        wellbeing: { energyLevel: 1 }, createdAt: Date.now() - 3_600_000,
      }]));
      localStorage.removeItem('moment.guardian.acknowledged-occurrences.v1');
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    }, profile);
    await page.goto('/');
    const originalCheckIns = await page.evaluate(() => localStorage.getItem('nimmapp_checkins_v1'));
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    const guardian = page.getByTestId('guardian');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    // Before 13:00, no unsolicited afternoon suggestion.
    await expect(guardian.getByText('مساحة صغيرة لاستعادة نشاطك')).toHaveCount(0);
    await expect(guardian.getByText('هنا متى احتجت')).toBeVisible();

    // The tab remains open; its minute refresh must activate timely guidance.
    await page.clock.fastForward(2 * 60_000);
    await expect(guardian.getByText('مساحة صغيرة لاستعادة نشاطك')).toBeVisible();
    await expect(guardian.getByText('سجّلت مستوى طاقة منخفضًا اليوم')).toBeVisible();

    // After 18:00, the same optional afternoon prompt should quietly retire.
    await page.clock.fastForward(5 * 60 * 60_000);
    await expect(guardian.getByText('مساحة صغيرة لاستعادة نشاطك')).toHaveCount(0);
    await expect(guardian.getByText('هنا متى احتجت')).toBeVisible();
    await expect(guardian).not.toContainText(/فشل|عقاب|إنذار|Ghrelin|28%|Überessen|Küchenschluss/);
    await expect(guardian.locator('.animate-pulse, .animate-ping, [class*="bg-red"], [class*="bg-rose"]')).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('nimmapp_checkins_v1'))).toBe(originalCheckIns);
  });
}
