import { expect, test } from '@playwright/test';

test('mobile Today home avoids unrelated animal overlays without blocking the main flow', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'ar');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: /مرحباً بك/ })).toBeVisible();
  await expect(page.getByTestId('primary-capture-button')).toBeVisible();

  const hero = page.getByTestId('today-organic-hero');
  await expect(hero).toBeVisible();
  const art = await hero.evaluate((element) => ({
    overlayImage: getComputedStyle(element, '::after').backgroundImage,
    heroImage: getComputedStyle(element).backgroundImage,
  }));
  expect(art.overlayImage).toBe('none');
  expect(art.heroImage).toContain('linear-gradient');
  expect(art.heroImage).not.toContain('url(');
  const voice = page.getByTestId('voice-home-mic');
  await voice.focus();
  await expect(voice).toBeFocused();

  await page.screenshot({ path: testInfo.outputPath('organic-hero-mobile.png'), fullPage: true });
});
