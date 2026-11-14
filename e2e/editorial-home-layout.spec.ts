import { test, expect } from '@playwright/test';

async function openArabicToday(page: import('@playwright/test').Page) {
  // Exercise the Today screen after the existing guest gate; separate tests must cover the gate itself.
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'ar');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });
  await page.goto('/');
  await expect(page.getByTestId('today-organic-hero')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', /^ar(?:-|$)/);
}

test('Arabic editorial home keeps its primary voice action on desktop', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openArabicToday(page);
  const hero = page.getByTestId('today-organic-hero');
  const voice = hero.getByTestId('voice-home-mic');
  await expect(hero).toBeVisible();
  await expect(voice).toBeVisible();
  await expect(hero).toHaveCSS('border-top-left-radius', '48px');
  await expect(voice).toHaveCSS('min-height', '200px');
  // Assert real grid placement, not merely a two-column template that children span.
  const gridPlacement = await hero.locator(':scope > div.relative > div').evaluateAll(nodes =>
    nodes.slice(0, 2).map(node => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return { column: style.gridColumnStart, x: rect.x, width: rect.width };
    })
  );
  expect(gridPlacement).toHaveLength(2);
  expect(gridPlacement.map(item => item.column)).toEqual(['1', '2']);
  expect(gridPlacement[0].x).not.toBe(gridPlacement[1].x);
  await expect(voice).toHaveAccessibleName(/\S/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('arabic-editorial-desktop.png'), fullPage: true });
});

test('Arabic editorial home remains usable at mobile width', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openArabicToday(page);
  const voice = page.getByTestId('today-organic-hero').getByTestId('voice-home-mic');
  await expect(voice).toBeVisible();
  await expect(voice).toHaveAccessibleName(/\S/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('arabic-editorial-mobile.png'), fullPage: true });
});
