import { expect, test } from '@playwright/test';

const profile = {
  summary: 'أريد متابعة يومي بهدوء', priorities: [], preferences: [],
  rawIntro: 'أريد متابعة يومي بهدوء', confirmedAt: 1,
  firstPlan: {
    title: 'يومي', rationale: 'لاحظ ما يناسبك', focusAreas: [],
    firstStep: 'دوّن ما ترغب', phase: 'midday',
  },
};

for (const viewport of [
  { name: 'desktop', width: 1280, height: 900, legacyLocale: 'de' },
  { name: 'mobile', width: 390, height: 844, legacyLocale: 'fr' },
]) {
  test(`Guardian stays Arabic-only and calm for legacy ${viewport.legacyLocale} on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.addInitScript(({ profile, locale }) => {
      const now = new Date();
      const today = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
      ].join('-');
      localStorage.setItem('rhythm_language_v1', locale);
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
      localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify(profile));
      localStorage.setItem('nimmapp_moments_v1', '[]');
      localStorage.setItem('nimmapp_checkins_v1', JSON.stringify([
        {
          id: 'legacy-short-sleep', date: today, time: '08:00',
          timeOfDay: 'morning', createdAt: 1,
          sleep: { durationHours: 5, wakeFeeling: 'tired', quality: 2 },
        },
      ]));
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    }, { profile, locale: viewport.legacyLocale });

    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    const guardian = page.getByTestId('guardian');
    await expect(guardian).toBeVisible();
    await expect(guardian).toContainText('مساحة لطيفة للاهتمام بنفسك');
    await expect(guardian).toContainText('قد تحتاج إلى بعض الراحة اليوم');
    await expect(guardian).not.toContainText(/Alarm aktiv|Ghrelin|ghréline|28%|Immediate intervention|فشل|عقاب|إنذار/);
    await expect(guardian.locator('.animate-pulse, .animate-ping, [class*="bg-red"], [class*="bg-rose"]')).toHaveCount(0);
  });
}
