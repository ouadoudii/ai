import { expect, test } from '@playwright/test';

for (const locale of ['ar', 'de'] as const) {
  test(`empty guest Coach never fabricates completed goals or screen-free meals (saved ${locale})`, async ({ page }, testInfo) => {
    await page.addInitScript((savedLocale) => {
      localStorage.setItem('rhythm_language_v1', savedLocale);
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
      localStorage.setItem('nimmapp_moments_v1', '[]');
      localStorage.setItem('nimmapp_checkins_v1', '[]');
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    }, locale);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    const nav = page.getByTestId(testInfo.project.name === 'android-arabic' ? 'mobile-coach-nav' : 'desktop-coach-nav');
    await nav.click();

    const checkEmpty = async () => {
      await expect(page.getByTestId('coach-screen-free-metric')).toHaveText('لا توجد ملاحظات عن الشاشات بعد');
      await expect(page.getByTestId('coach-goals-summary')).toContainText('0 / 4 مكتملة');
      await expect(page.getByTestId('coach-goals-note')).toContainText('لا توجد وجبات مسجلة بعد');
      await expect(page.getByTestId('coach-goal-goal-1')).toContainText('0/3');
      await expect(page.getByTestId('coach-goal-goal-2')).toContainText('0/2');
      await expect(page.getByTestId('coach-goal-goal-3')).toContainText('0/3');
      await expect(page.getByTestId('coach-goal-goal-4')).toContainText('0/3');
      await expect(page.getByTestId('coach-goals-section').getByRole('button')).toHaveCount(0);
      const counts = await page.evaluate(() => [
        JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]').length,
        JSON.parse(localStorage.getItem('nimmapp_checkins_v1') || '[]').length,
      ]);
      expect(counts).toEqual([0, 0]);
    };
    await checkEmpty();
    await page.reload();
    await nav.click();
    await checkEmpty();
  });
}
