import { expect, test } from '@playwright/test';

test('mobile home keeps the warm mosaic background behind readable content', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'de');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });

  await page.goto('/');
  await expect(page.getByTestId('primary-capture-button')).toBeVisible();

  const bodyBackground = await page.locator('body').evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      image: styles.backgroundImage,
      size: styles.backgroundSize,
    };
  });

  expect(bodyBackground.image).toContain('linear-gradient');
  expect(bodyBackground.image).toContain('radial-gradient');
  expect(bodyBackground.size).toContain('56px 98px');

  await page.screenshot({ path: testInfo.outputPath('mosaic-background-mobile.png'), fullPage: true });
});
