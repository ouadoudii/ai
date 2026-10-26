import { expect, test } from '@playwright/test';

for (const viewport of [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test(`midday catch-up is a focus-contained dialog on ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.addInitScript(() => {
      localStorage.setItem('rhythm_language_v1', 'en');
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
      localStorage.setItem('nimmapp_moments_v1', '[]');
      localStorage.setItem('nimmapp_checkins_v1', '[]');
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    });

    await page.goto('/');
    const browserTime = await page.evaluate(() => ({ now: Date.now(), hour: new Date().getHours() }));
    const hoursToCatchUp = (17 - browserTime.hour + 24) % 24;
    await page.clock.setFixedTime(new Date(browserTime.now + hoursToCatchUp * 60 * 60 * 1000));
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    await page.getByTestId(viewport.name === 'desktop' ? 'desktop-coach-nav' : 'mobile-coach-nav').click();
    const opener = page.getByRole('button', { name: 'Check-in starten', exact: true });
    await expect(opener).toBeVisible();
    await opener.click();

    const dialog = page.getByRole('dialog');
    const close = dialog.getByRole('button', { name: 'إغلاق', exact: true });
    const focusable = dialog.locator(
      'button:not([disabled]):visible, input:not([disabled]):visible, select:not([disabled]):visible, textarea:not([disabled]):visible, [tabindex]:not([tabindex="-1"]):visible',
    );
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleName(/.+/);
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(page.locator('#root')).toHaveAttribute('inert', '');
    await expect(page.locator('#root')).toHaveAttribute('aria-hidden', 'true');
    await expect(close).toBeFocused();
    expect(await focusable.count()).toBeGreaterThan(1);

    const firstFocusable = focusable.first();
    const lastFocusable = focusable.last();
    await firstFocusable.focus();
    await page.keyboard.press('Shift+Tab');
    await expect(lastFocusable).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(firstFocusable).toBeFocused();

    await page.screenshot({ path: testInfo.outputPath(`catchup-${viewport.name}.png`), fullPage: true });
    await page.keyboard.press('Escape');

    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
    await expect(page.locator('#root')).not.toHaveAttribute('inert', '');
    await expect(page.locator('#root')).not.toHaveAttribute('aria-hidden', 'true');
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('nimmapp_checkins_v1') || '[]').length)).toBe(0);
  });
}
