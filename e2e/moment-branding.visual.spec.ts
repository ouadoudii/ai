import { expect, test } from '@playwright/test';

test('production shell presents Moment branding before and after app startup', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'de');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });

  await page.goto('/');
  await expect(page).toHaveTitle('Moment — Food, Sleep & Everyday Rhythm');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Moment');
  await expect(page.getByTestId('primary-capture-button')).toBeVisible();
});
