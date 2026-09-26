import { expect, test } from '@playwright/test';

const MOMENTS_KEY = 'nimmapp_moments_v1';

test.describe('journal deletion persistence', () => {
  test('a deleted mixed-language meal stays absent after a full reload', async ({ page }) => {
    const deletedTitle = 'بيض مسلوق · pain complet · Kaffee';
    const keptTitle = 'Harira · Wasser';

    // Establish the real app origin first, then seed storage and reload so React hydrates
    // from the baseline exactly once. A persistent init script would reinsert the deleted
    // record on every reload and would test the fixture rather than deletion persistence.
    await page.goto('/');
    await page.evaluate(({ key, deleted, kept }) => {
      localStorage.setItem(key, JSON.stringify([
        { id: 'deleted-meal', title: deleted, timestamp: new Date().toISOString(), type: 'meal' },
        { id: 'kept-meal', title: kept, timestamp: new Date().toISOString(), type: 'meal' },
      ]));
    }, { key: MOMENTS_KEY, deleted: deletedTitle, kept: keptTitle });
    await page.reload();

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