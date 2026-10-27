import { expect, test } from '@playwright/test';

test('mobile home keeps calm untiled organic backgrounds behind readable Arabic content', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'ar');
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
      color: styles.backgroundColor,
    };
  });

  expect(bodyBackground.image).toContain('linear-gradient');
  expect(bodyBackground.image).toContain('radial-gradient');
  expect(bodyBackground.size).not.toContain('56px 98px');
  expect(bodyBackground.image).not.toContain('url(');
  expect(bodyBackground.color).toBe('rgb(248, 242, 233)');
  await expect(page.getByTestId('daily-heart-note')).toBeVisible();

  await page.screenshot({ path: testInfo.outputPath('organic-background-mobile.png'), fullPage: true });
});
