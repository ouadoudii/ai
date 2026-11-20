import { test, expect } from '@playwright/test';

for (const { name, viewport } of [
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
  { name: 'mobile', viewport: { width: 390, height: 844 } },
]) {
  test(`Arabic navigation exposes a single active page on ${name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.addInitScript(() => {
      localStorage.setItem('rhythm_language_v1', 'ar');
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    const nav = page.locator(name === 'desktop' ? 'header nav' : 'nav.md\\:hidden');
    await expect(nav).toBeVisible();
    await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
    if (name === 'desktop') {
      await nav.getByTestId('desktop-coach-nav').click();
      await expect(nav.getByTestId('desktop-coach-nav')).toHaveAttribute('aria-current', 'page');
      await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
      await expect(nav.getByTestId('desktop-capture-button')).not.toHaveAttribute('aria-current', 'page');
    } else {
      await nav.getByTestId('mobile-moments-nav').click();
      await expect(nav.getByTestId('mobile-moments-nav')).toHaveAttribute('aria-current', 'page');
      await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
    }
  });
}
