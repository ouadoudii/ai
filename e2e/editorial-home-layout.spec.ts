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
  // Keyboard users must be able to reach and see the main action, not only see it visually.
  // Traverse the real keyboard sequence from the beginning of the document.
  // Programmatic focus alone does not prove keyboard accessibility.
  await page.keyboard.press('ControlOrMeta+Home');
  await page.evaluate(() => (document.activeElement instanceof HTMLElement) && document.activeElement.blur());
  let reachedByTab = false;
  for (let index = 0; index < 80; index += 1) {
    await page.keyboard.press('Tab');
    if (await voice.evaluate(element => element === document.activeElement)) {
      reachedByTab = true;
      break;
    }
  }
  expect(reachedByTab, 'Primary voice action must be reachable using Tab').toBe(true);
  await expect(voice).toBeFocused();
  const keyboardFocusStyle = await voice.evaluate(element => {
    const style = getComputedStyle(element);
    return {
      focusVisible: element.matches(':focus-visible'),
      outlineStyle: style.outlineStyle,
      outlineWidth: parseFloat(style.outlineWidth),
      boxShadow: style.boxShadow,
    };
  });
  expect(keyboardFocusStyle.focusVisible).toBe(true);
  expect(
    (keyboardFocusStyle.outlineStyle !== 'none' && keyboardFocusStyle.outlineWidth > 0)
      || keyboardFocusStyle.boxShadow !== 'none',
    'Keyboard focus must have a visible outline or shadow',
  ).toBe(true);
  const focusVisibility = await voice.evaluate(element => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return { visible: rect.width > 0 && rect.height > 0, hidden: style.visibility === 'hidden' };
  });
  expect(focusVisibility.visible).toBe(true);
  expect(focusVisibility.hidden).toBe(false);
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

test('Arabic home stays readable at narrow mobile and desktop zoom-equivalent widths', async ({ page }) => {
  for (const viewport of [{ width: 320, height: 700 }, { width: 720, height: 450 }]) {
    await page.setViewportSize(viewport);
    await openArabicToday(page);
    const hero = page.getByTestId('today-organic-hero');
    const voice = hero.getByTestId('voice-home-mic');
    await expect(voice).toBeVisible();
    const geometry = await voice.evaluate(element => {
      const bounds = element.getBoundingClientRect();
      return { left: bounds.left, right: bounds.right, width: bounds.width };
    });
    expect(geometry.width).toBeGreaterThan(0);
    expect(geometry.left).toBeGreaterThanOrEqual(-1);
    expect(geometry.right).toBeLessThanOrEqual(viewport.width + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  }
});
