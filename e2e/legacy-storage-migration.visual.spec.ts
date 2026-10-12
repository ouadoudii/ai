import { expect, test } from '@playwright/test';

for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  test(`legacy meals survive startup and reload at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.addInitScript(() => {
      if (localStorage.getItem('migration-test-seeded')) return;
      localStorage.setItem('migration-test-seeded', 'true');
      localStorage.setItem('rhythm_language_v1', 'en');
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
      const date = new Date().toISOString().slice(0, 10);
      localStorage.setItem('food_journey_moments_v1', JSON.stringify([{
        id: 'legacy-lunch', title: 'كسكس Couscous', category: 'lunch', label: 'Lunch',
        date, time: '12:00', location: 'Home', locationCategory: 'home',
        imageUrl: '', mood: 'satisfied', tags: [], createdAt: Date.now(),
      }]));
      localStorage.setItem('getyourcoach_checkins_v1', JSON.stringify([{
        id: 'legacy-check', date, time: '12:00', timeOfDay: 'midday', wellbeing: {}, createdAt: Date.now(),
      }]));
    });
    await page.goto('/');
    for (let visit = 0; visit < 2; visit++) {
      await expect.poll(() => page.evaluate(() =>
        JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]').map((m: { title: string }) => m.title),
      )).toContain('كسكس Couscous');
      expect(await page.evaluate(() => JSON.parse(localStorage.getItem('nimmapp_checkins_v1') || '[]')
        .some((c: { id: string }) => c.id === 'legacy-check'))).toBe(true);
      await expect(page.getByText('كسكس Couscous', { exact: true }).first()).toBeVisible();
      await page.screenshot({ path: `test-results/legacy-migration-${viewport.width}-${visit}.png`, fullPage: true });
      if (visit === 0) await page.reload();
    }
  });
}
