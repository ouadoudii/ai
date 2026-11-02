import { expect, test } from '@playwright/test';

// A malformed imported clock must not silently erase a person's own fatigue report.
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
  for (const recoveryClock of ['99:99', '14:xx', '14:00'] as const) {
    test(`P0 Guardian respects ${recoveryClock === '14:00' ? 'valid' : 'corrupt'} recovery time on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.clock.setFixedTime(new Date('2026-11-02T15:00:00Z'));
      await page.addInitScript(({ profile, recoveryClock }) => {
        const now = new Date();
        const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
        localStorage.setItem('rhythm_language_v1', 'ar');
        localStorage.setItem('cary_access_mode_v1', 'guest');
        localStorage.setItem('cary_onboarding_v2_complete', 'true');
        localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
        localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify(profile));
        localStorage.setItem('nimmapp_moments_v1', JSON.stringify([{
          id: 'tired-after-harira', title: 'حريرة 7rira', label: 'غداء', category: 'lunch',
          date, time: '12:30', location: 'البيت', locationCategory: 'home',
          imageUrl: '', tags: ['Darija'], eatingPace: 'slow', distraction: 'mindful',
          energyAfter: 'sluggish', createdAt: 100,
        }]));
        localStorage.setItem('nimmapp_checkins_v1', JSON.stringify([{
          id: 'imported-steady-checkin', date, time: recoveryClock, timeOfDay: 'midday',
          wellbeing: { energyLevel: 4 }, createdAt: 300,
        }]));
        localStorage.removeItem('moment.guardian.acknowledged-occurrences.v1');
        sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
      }, { profile, recoveryClock });
      await page.goto('/');
      const before = await page.evaluate(() => [
        localStorage.getItem('nimmapp_moments_v1'),
        localStorage.getItem('nimmapp_checkins_v1'),
      ]);
      await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
      const guardian = page.getByTestId('guardian');
      await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      if (recoveryClock !== '14:00') {
        await expect(guardian.getByText('مساحة صغيرة لاستعادة نشاطك')).toBeVisible();
        await expect(guardian.getByText('ذكرت أنك شعرت بقلة النشاط بعد وجبتك')).toBeVisible();
        await expect(guardian.getByRole('button', { name: /إخفاء الفكرة/ })).toHaveCount(1);
      } else {
        await expect(guardian.getByText('مساحة صغيرة لاستعادة نشاطك')).toHaveCount(0);
        await expect(guardian.getByText('هنا متى احتجت')).toBeVisible();
      }
      await expect(guardian).not.toContainText(/99:99|14:xx|فشل|عقاب|إنذار|Ghrelin|28%|Überessen/);
      await expect(guardian.locator('.animate-pulse, .animate-ping, [class*="bg-red"], [class*="bg-rose"]')).toHaveCount(0);
      expect(await page.evaluate(() => [
        localStorage.getItem('nimmapp_moments_v1'),
        localStorage.getItem('nimmapp_checkins_v1'),
      ])).toEqual(before);
    });
  }
}
