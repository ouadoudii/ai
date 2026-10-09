import { expect, test } from '@playwright/test';

for (const viewport of [{ name: 'desktop', width: 1280, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
  test(`Today home retains capture and personal plan on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.addInitScript(() => {
      localStorage.setItem('rhythm_language_v1', 'de');
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    });
    await page.goto('/');
    await expect(page.getByTestId('primary-capture-button')).toBeVisible();
    await expect(page.getByTestId('voice-home-mic')).toBeVisible();
    await expect(page.getByText('Deine letzten Momente')).toBeVisible();
  });
}
