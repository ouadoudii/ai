import { expect, test } from '@playwright/test';

test('Arabic organic design is calm, RTL and keyboard-accessible on desktop and Android', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'ar');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });
  await page.goto('/');
  const hero = page.getByTestId('today-organic-hero');
  await expect(hero).toBeVisible();
  await expect(page.getByTestId('daily-heart-note')).toBeVisible();

  const design = await page.evaluate(() => {
    const heroElement = document.querySelector('[data-testid="today-organic-hero"]');
    if (!heroElement) throw new Error('Today hero is missing');
    return {
      direction: document.documentElement.dir,
      bodyImage: getComputedStyle(document.body).backgroundImage,
      heroImage: getComputedStyle(heroElement).backgroundImage,
      fontFamily: getComputedStyle(document.body).fontFamily,
      backgroundColor: getComputedStyle(document.body).backgroundColor,
    };
  });
  expect(design.direction).toBe('rtl');
  expect(design.fontFamily).toMatch(/Noto Sans Arabic|Cairo/);
  expect(design.backgroundColor).toBe('rgb(248, 242, 233)');
  expect(design.bodyImage).toContain('radial-gradient');
  expect(design.bodyImage).not.toContain('url(');
  expect(design.heroImage).toContain('linear-gradient');
  expect(design.heroImage).not.toContain('url(');

  const voice = page.getByTestId('voice-home-mic');
  await voice.focus();
  await expect(voice).toBeFocused();
  const focus = await voice.evaluate(element => ({
    width: parseFloat(getComputedStyle(element).outlineWidth),
    style: getComputedStyle(element).outlineStyle,
  }));
  expect(focus.width).toBeGreaterThanOrEqual(3);
  expect(focus.style).toBe('solid');
});
