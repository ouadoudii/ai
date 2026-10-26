import { expect, test } from '@playwright/test';

test('production shell presents Arabic ريثم branding before and after app startup', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'de');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });

  await page.goto('/');
  await expect(page).toHaveTitle('ريثم — الطعام والنوم وإيقاع الحياة اليومية');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'ريثم');
  await expect(page.locator('head')).not.toContainText('Moment');
  // Desktop and mobile render different capture CTAs; both must be accessible in Arabic.
  const viewport = page.viewportSize();
  const captureButton = page.getByTestId(viewport && viewport.width < 768
    ? 'primary-capture-button'
    : 'desktop-capture-button');
  await expect(captureButton).toBeVisible();
  await expect(captureButton).toBeEnabled();
});
