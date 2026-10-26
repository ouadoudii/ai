import { expect, test } from '@playwright/test';

const legacyLanguages = ['de', 'fr'] as const;

for (const legacyLanguage of legacyLanguages) {
  test(`legacy ${legacyLanguage} keeps the personal-plan check-in fully Arabic`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(({ language }) => {
      localStorage.setItem('rhythm_language_v1', language);
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
      localStorage.setItem('nimmapp_moments_v1', '[]');
      localStorage.setItem('nimmapp_checkins_v1', '[]');
      localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify({
        summary: 'Profile',
        priorities: ['meal'],
        preferences: ['simple'],
        rawIntro: 'I want to understand my midday rhythm.',
        confirmedAt: Date.now(),
        firstPlan: {
          title: 'Plan',
          rationale: 'Rationale',
          focusAreas: ['meal'],
          firstStep: 'Check in',
          phase: 'midday'
        }
      }));
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    }, { language: legacyLanguage });

    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    const planStart = page.getByTestId('personal-plan-start');
    await expect(planStart).toBeVisible();
    await planStart.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('منتصف يومك · 1/2', { exact: true })).toBeVisible();
    await expect(dialog.getByRole('heading', { name: 'كيف يسير يومك؟', exact: true })).toBeVisible();
    await expect(dialog.getByText('قبل الأكل، كم كان جوعك؟', { exact: true })).toBeVisible();
    await expect(dialog.getByText('وبعدها، كم شعرت بالشبع؟', { exact: true })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'خطوة أخيرة', exact: true })).toBeVisible();

    await dialog.getByRole('button', { name: 'خطوة أخيرة', exact: true }).click();
    await expect(dialog.getByText('منتصف يومك · 2/2', { exact: true })).toBeVisible();
    await expect(dialog.getByText('كيف طاقتك الآن؟', { exact: true })).toBeVisible();
    await expect(dialog.getByText('وأقرب شعور لك الآن؟', { exact: true })).toBeVisible();
    await expect(dialog.getByText('لا توجد إجابة صحيحة أو خاطئة. نحن نجمع لحظات حقيقية لنرى ما يتكرر مع الوقت.', { exact: true })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'رجوع', exact: true })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'تم', exact: true })).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath(`daily-checkin-legacy-${legacyLanguage}-arabic.png`),
      fullPage: true
    });
  });
}
