import { expect, test } from '@playwright/test';

test('mobile Today home shows Moment animal companions without blocking the main flow', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'de');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Willkommen zurück/i })).toBeVisible();
  await expect(page.getByTestId('primary-capture-button')).toBeVisible();

  const hero = page.locator('[class*="max-w-[860px]"] > section').first();
  const art = await hero.evaluate((element) => {
    const styles = getComputedStyle(element, '::after');
    return {
      image: styles.backgroundImage,
      pointerEvents: styles.pointerEvents,
      width: parseFloat(styles.width),
    };
  });

  expect(art.image).toContain('moment-animal-companions.svg');
  expect(art.image).not.toContain('cary-animal-companions.svg');
  expect(art.pointerEvents).toBe('none');
  expect(art.width).toBeGreaterThan(100);

  await page.screenshot({ path: testInfo.outputPath('animal-companions-mobile.png'), fullPage: true });
});
