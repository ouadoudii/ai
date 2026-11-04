import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'ar');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`Arabic home layout is readable and navigable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    const hero = page.getByTestId('today-organic-hero');
    await expect(hero).toBeVisible();
    const mic = page.getByTestId('voice-home-mic');
    await expect(mic).toBeVisible();
    const heroBox = await hero.boundingBox();
    expect(heroBox).not.toBeNull();
    expect(heroBox!.width).toBeLessThanOrEqual(viewport.width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width + 1);
    await mic.focus();
    await expect(mic).toBeFocused();
    if (viewport.width >= 1024) {
      expect(heroBox!.width).toBeGreaterThan(900);
      const morning = page.getByTestId('today-phase-morning');
      const midday = page.getByTestId('today-phase-midday');
      // Depending on local clock time, some check-in phases are intentionally hidden.
      if (await morning.isVisible() && await midday.isVisible()) {
        const a = await morning.boundingBox();
        const b = await midday.boundingBox();
        expect(a).not.toBeNull();
        expect(b).not.toBeNull();
        expect(Math.abs(a!.y - b!.y)).toBeLessThan(5);
      }
    } else {
      expect(heroBox!.width).toBeGreaterThan(340);
    }
  });
}
