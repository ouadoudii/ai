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

    // Verify actual browser-computed contrast in both desktop and Android layouts,
    // including the small voice badge and the primary check-in action.
    const checkInAction = page.getByTestId('coach-checkin-cta');
    const voiceBadge = page.getByTestId('coach-voice-badge');
    for (const control of [voiceBadge, checkInAction]) {
      await expect(control).toBeVisible();
      const ratio = await control.evaluate((element) => {
        const style = window.getComputedStyle(element);
        const luminance = (cssColor: string) => {
          const channels = cssColor.match(/\\d+/g)?.slice(0, 3).map((part) => {
            const value = Number(part) / 255;
            return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
          });
          if (!channels || channels.length !== 3) throw new Error('Expected an opaque RGB color');
          return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
        };
        const foreground = luminance(style.color);
        const background = luminance(style.backgroundColor);
        return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
      });
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
    await expect(checkInAction).toHaveCSS('min-height', '48px');

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
