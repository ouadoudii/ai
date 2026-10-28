import { expect, test } from '@playwright/test';

for (const savedLocale of ['ar', 'de'] as const) {
  test(`coach discovery invitation is nonjudgmental and keyboard-accessible with saved ${savedLocale}`, async ({ page }, testInfo) => {
    await page.addInitScript((locale) => {
      localStorage.setItem('rhythm_language_v1', locale);
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
      localStorage.setItem('nimmapp_moments_v1', '[]');
      localStorage.setItem('nimmapp_checkins_v1', '[]');
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    }, savedLocale);

    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    const nav = page.getByTestId(testInfo.project.name === 'android-arabic' ? 'mobile-coach-nav' : 'desktop-coach-nav');
    await nav.click();

    const discovery = page.getByTestId('coach-discoveries-link');
    await expect(discovery).toBeVisible();
    await expect(discovery).toHaveAttribute('type', 'button');
    await expect(discovery).toContainText('اكتشف ما يتكرر في يومك');
    await expect(discovery).toContainText('ملاحظات من يومك، لا أحكام على طعامك');
    await expect(page.locator('body')).not.toContainText('نمط تغذيتك');
    await expect(page.locator('body')).not.toContainText('ما نمط تغذيتي؟');

    await discovery.focus();
    await expect(discovery).toBeFocused();
    await discovery.press('Enter');
    await expect(page.getByTestId('early-personal-orientation')).toBeVisible();

    await nav.click();
    await page.getByTestId('coach-discoveries-link').focus();
    await page.getByTestId('coach-discoveries-link').press('Space');
    await expect(page.getByTestId('early-personal-orientation')).toBeVisible();
  });
}
