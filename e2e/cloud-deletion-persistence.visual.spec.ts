import { expect, test } from '@playwright/test';

const MOMENTS_KEY = 'nimmapp_moments_v1';

test.describe('journal deletion persistence', () => {
  test('a deleted mixed-language meal stays absent after a full reload', async ({ page }) => {
    const deletedTitle = 'بيض مسلوق · pain complet · Kaffee';
    const keptTitle = 'Harira · Wasser';

    // Seed the journal before React hydrates. Guard the seed so the later reload observes
    // the app's persisted deletion instead of re-inserting the fixture.
    await page.addInitScript(({ key, deleted, kept }) => {
      localStorage.setItem('rhythm_language_v1', 'en');
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_intro_profile_v1', '{}');
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
      if (localStorage.getItem(key) === null) {
        localStorage.setItem(key, JSON.stringify([
          { id: 'deleted-meal', title: deleted, timestamp: new Date().toISOString(), type: 'meal' },
          { id: 'kept-meal', title: kept, timestamp: new Date().toISOString(), type: 'meal' },
        ]));
      }
    }, { key: MOMENTS_KEY, deleted: deletedTitle, kept: keptTitle });

    await page.goto('/');

    await expect.poll(async () => page.evaluate((key) => {
      const moments = JSON.parse(localStorage.getItem(key) || '[]');
      return moments.some((moment: { id?: string }) => moment.id === 'deleted-meal');
    }, MOMENTS_KEY)).toBe(true);

    await page.evaluate((key) => {
      const moments = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify(moments.filter((moment: { id?: string }) => moment.id !== 'deleted-meal')));
    }, MOMENTS_KEY);

    await page.reload();

    const persistedIds = await page.evaluate((key) => {
      const moments = JSON.parse(localStorage.getItem(key) || '[]');
      return moments.map((moment: { id?: string }) => moment.id);
    }, MOMENTS_KEY);
    expect(persistedIds).not.toContain('deleted-meal');
    expect(persistedIds).toContain('kept-meal');

    await expect(page.getByText(deletedTitle, { exact: false })).toHaveCount(0);
  });
});
