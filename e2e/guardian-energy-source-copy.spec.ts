import { expect, test } from '@playwright/test';

// Keep the meal and check-in fixtures in the observed afternoon on every runner.
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
  for (const source of ['meal', 'checkin'] as const) {
    test(`P0 Guardian names the actual energy observation without invented data on ${viewport.name} (${source})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.clock.setFixedTime(new Date('2026-11-02T15:00:00Z'));
      await page.addInitScript(({ profile, source }) => {
        const now = new Date();
        const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
        localStorage.setItem('rhythm_language_v1', 'ar');
        localStorage.setItem('cary_access_mode_v1', 'guest');
        localStorage.setItem('cary_onboarding_v2_complete', 'true');
        localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
        localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify(profile));
        localStorage.setItem('nimmapp_moments_v1', JSON.stringify(source === 'meal' ? [{
          id: 'reported-after-meal', title: 'حريرة 7rira', label: 'غداء', category: 'lunch',
          date, time: '12:30', location: 'البيت', locationCategory: 'home',
          imageUrl: '', tags: ['Darija'], eatingPace: 'slow', distraction: 'mindful',
          energyAfter: 'sluggish', createdAt: Date.now(),
        }] : []));
        localStorage.setItem('nimmapp_checkins_v1', JSON.stringify(source === 'checkin' ? [{
          id: 'reported-low-energy', date, time: '14:00', timeOfDay: 'midday',
          wellbeing: { energyLevel: 1 }, createdAt: Date.now(),
        }] : []));
        localStorage.removeItem('moment.guardian.acknowledged-occurrences.v1');
        sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
      }, { profile, source });
      await page.goto('/');
      const before = await page.evaluate(() => [
        localStorage.getItem('nimmapp_moments_v1'),
        localStorage.getItem('nimmapp_checkins_v1'),
      ]);
      await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
      const guardian = page.getByTestId('guardian');
      await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      await expect(guardian.getByText('مساحة صغيرة لاستعادة نشاطك')).toBeVisible();
      await expect(guardian.getByText(source === 'meal'
        ? 'ذكرت أنك شعرت بقلة النشاط بعد وجبتك'
        : 'سجّلت مستوى طاقة منخفضًا اليوم')).toBeVisible();
      if (source === 'meal') {
        await expect(guardian).not.toContainText('سجّلت مستوى طاقة منخفضًا اليوم');
      }
      await expect(guardian.getByRole('button', { name: /إخفاء الفكرة/ })).toHaveCount(1);
      await expect(guardian.getByRole('status')).toContainText('أفكار يمكنك تجاهلها');
      await expect(guardian).not.toContainText(/فشل|عقاب|إنذار|Ghrelin|28%|Überessen/);
      await expect(guardian.locator('.animate-pulse, .animate-ping, [class*="bg-red"], [class*="bg-rose"]')).toHaveCount(0);
      expect(await page.evaluate(() => [
        localStorage.getItem('nimmapp_moments_v1'),
        localStorage.getItem('nimmapp_checkins_v1'),
      ])).toEqual(before);
    });
  }
}
