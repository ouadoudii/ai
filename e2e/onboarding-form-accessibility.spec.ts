import { devices, expect, test, type Browser } from '@playwright/test';

type Layout = 'desktop' | 'mobile';

async function openNewUser(browser: Browser, layout: Layout) {
  const context = await browser.newContext({
    ...devices[layout === 'desktop' ? 'Desktop Chrome' : 'Pixel 7'],
    baseURL: 'http://127.0.0.1:4173',
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'en');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('nimmapp_moments_v1', '[]');
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    localStorage.removeItem('rhythm_intro_profile_v1');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });
  await page.goto('/');
  return { context, page };
}

for (const layout of ['desktop', 'mobile'] as const) {
  test(`#172 ${layout}: quick form receives and contains keyboard focus`, async ({ browser }, testInfo) => {
    const { context, page } = await openNewUser(browser, layout);
    try {
      await page.getByTestId('voice-first-entry-form').click();
      const goal = page.getByTestId('onboarding-goal');
      const back = page.getByTestId('voice-first-entry-back');
      const rhythm = page.getByTestId('onboarding-rhythm');
      const save = page.getByTestId('onboarding-form-save');

      await expect(goal).toBeFocused();
      await expect(page.locator('#root')).toHaveAttribute('inert', '');

      await back.focus();
      await page.keyboard.press('Shift+Tab');
      await expect(rhythm).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(back).toBeFocused();

      await goal.fill('Understand my energy');
      await save.focus();
      await page.keyboard.press('Tab');
      await expect(back).toBeFocused();

      await back.click();
      await expect(page.getByTestId('voice-first-entry-form')).toBeFocused();
      await page.screenshot({ path: testInfo.outputPath(`onboarding-focus-${layout}.png`), fullPage: true });
    } finally {
      await context.close();
    }
  });
}
