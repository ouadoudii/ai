import { expect, test } from '@playwright/test';

const prepare = async (page: any) => page.addInitScript(() => {
  localStorage.setItem('rhythm_language_v1', 'de');
  localStorage.setItem('cary_access_mode_v1', 'guest');
  localStorage.setItem('cary_onboarding_v2_complete', 'true');
  localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
  localStorage.setItem('nimmapp_moments_v1', '[]');
  localStorage.setItem('nimmapp_checkins_v1', '[]');
  localStorage.removeItem('cary_coach_session_v1');
  sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
});

for (const viewport of [
  { name: 'desktop', width: 1280, height: 900, nav: 'desktop-coach-nav' },
  { name: 'mobile', width: 390, height: 844, nav: 'mobile-coach-nav' },
] as const) {
  test(`Moment coach has no retired branding on ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await prepare(page);
    await page.goto('/');

    const nav = page.getByTestId(viewport.nav);
    await expect(nav).toBeVisible();
    await expect(nav).toHaveText('المرشد');
    await nav.click();

    await expect(page.getByRole('heading', { name: 'Coach fragen' })).toBeVisible();
    await expect(page.getByText('Moment • Fürsorgliche Begleitung für Körper & Geist')).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/Cary|كاري/u);
    await page.screenshot({ path: testInfo.outputPath(`moment-coach-${viewport.name}.png`), fullPage: true });
  });
}
