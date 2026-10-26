import { test, expect } from '@playwright/test';

const legacyLanguages = ['en', 'de', 'fr', 'ar'] as const;

for (const legacyLanguage of legacyLanguages) {
  test(`usual time uses Arabic UI for legacy locale ${legacyLanguage} on mobile`, async ({ page }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(language => {
      const moments = ['05:20', '05:30', '05:40'].map((time, i) => ({
        id: 'real-' + i, title: 'Eggs', label: 'Snack', category: 'snack', date: '2026-10-11',
        time, location: 'Home', locationCategory: 'home', imageUrl: '', mood: 'satisfied',
        tags: [], createdAt: i + 1,
      }));
      localStorage.setItem('nimmapp_moments_v1', JSON.stringify(moments));
      localStorage.setItem('rhythm_language_v1', language);
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    }, legacyLanguage);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await page.getByTestId('primary-capture-button').click();
    await page.locator('[data-capture-method="text"]').click();
    await expect(page.getByTestId('usual-meal-time-suggestion')).toContainText('وقتك المعتاد لهذه الوجبة');
    await expect(page.getByTestId('use-usual-meal-time')).toHaveAttribute('aria-pressed', 'false');
    await page.screenshot({ path: info.outputPath(`usual-time-arabic-${legacyLanguage}.png`), fullPage: true });
  });
}
