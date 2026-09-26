import { expect, test } from '@playwright/test';

const MOMENTS_KEY = 'nimmapp_moments_v1';

test.describe('journal deletion persistence', () => {
  test('a deleted mixed-language meal stays absent after a full reload', async ({ page }) => {
    const deletedTitle = 'بيض مسلوق · pain complet · Kaffee';
    const keptTitle = 'Harira · Wasser';

    // Seed structurally valid FoodMoments before React hydrates. The startup storage
    // migration intentionally removes invalid persisted records, so this fixture must
    // represent data that a real app session could have written.
    await page.addInitScript(({ key, deleted, kept }) => {
      localStorage.setItem('rhythm_language_v1', 'en');
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_intro_profile_v1', '{}');
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
      if (localStorage.getItem(key) === null) {
        const now = new Date();
        const date = now.toISOString().slice(0, 10);
        const time = now.toTimeString().slice(0, 5);
        const createdAt = now.getTime();
        const moment = (id: string, title: string) => ({
          id,
          title,
          label: 'Lunch',
          category: 'lunch',
          date,
          time,
          location: 'Home',
          locationCategory: 'home',
          imageUrl: '',
          mood: 'satisfied',
          tags: [],
          createdAt,
        });
        localStorage.setItem(key, JSON.stringify([
          moment('deleted-meal', deleted),
          moment('kept-meal', kept),
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
