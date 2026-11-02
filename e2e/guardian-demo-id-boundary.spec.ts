import { expect, test } from '@playwright/test';

test.use({ timezoneId: 'UTC' });

const profile = {
  summary: 'أريد متابعة يومي بهدوء', priorities: [], preferences: [],
  rawIntro: 'أريد متابعة يومي بهدوء', confirmedAt: 1,
  firstPlan: { title: 'لاحظ', rationale: 'بهدوء', focusAreas: [], firstStep: 'ابدأ', phase: 'midday' },
};

for (const viewport of [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test(`P0 Guardian never treats personal sim-prefixed records as active demos on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const afternoon = new Date();
    afternoon.setUTCHours(15, 0, 0, 0);
    await page.clock.setFixedTime(afternoon);
    await page.addInitScript((savedProfile) => {
      const now = new Date();
      const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
      localStorage.setItem('rhythm_language_v1', 'ar');
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
      localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify(savedProfile));
      localStorage.setItem('nimmapp_moments_v1', JSON.stringify([{
        id: 'sim-personal-future-meal', title: 'حريرة', label: 'عشاء',
        category: 'dinner', date: today, time: '19:00', location: 'البيت',
        locationCategory: 'home', imageUrl: '', tags: [], eatingPace: 'rushed',
        distraction: 'screen', createdAt: Date.now(),
      }]));
      localStorage.setItem('nimmapp_checkins_v1', JSON.stringify([{
        id: 'sim-personal-legacy', date: 'Heute', time: '07:00', timeOfDay: 'morning',
        sleep: { durationHours: 4, quality: 1, wakeFeeling: 'exhausted' },
        createdAt: Date.now(),
      }]));
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    }, profile);
    await page.goto('/');
    expect(await page.evaluate(() => new Date().getHours())).toBe(15);
    const original = await page.evaluate(() => [
      localStorage.getItem('nimmapp_moments_v1'),
      localStorage.getItem('nimmapp_checkins_v1'),
    ]);
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    const guardian = page.getByTestId('guardian');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(guardian.getByText('هنا متى احتجت')).toBeVisible();
    await expect(guardian.getByRole('button', { name: /إخفاء الفكرة/ })).toHaveCount(0);

    await guardian.getByRole('button', { name: /تجربة لطيفة/ }).click();
    await guardian.getByRole('button', { name: /نوم أقل من المعتاد/ }).click();
    await expect(guardian.getByTestId('guardian-demo-notice')).toContainText('هذه أمثلة وليست تسجيلاتك');
    await expect(guardian.getByText('قد تحتاج إلى بعض الراحة اليوم')).toBeVisible();
    await guardian.getByRole('button', { name: /إعادة ضبط/ }).click();
    await expect(guardian.getByText('هنا متى احتجت')).toBeVisible();
    await expect(guardian.getByRole('button', { name: /إخفاء الفكرة/ })).toHaveCount(0);
    await expect(guardian).not.toContainText(/فشل|عقاب|إنذار|Ghrelin|28%|Überessen/);
    await expect(guardian.locator('.animate-pulse, .animate-ping, [class*="bg-red"], [class*="bg-rose"]')).toHaveCount(0);
    expect(await page.evaluate(() => [
      localStorage.getItem('nimmapp_moments_v1'),
      localStorage.getItem('nimmapp_checkins_v1'),
    ])).toEqual(original);
  });
}
