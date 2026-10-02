import { describe, expect, it } from 'vitest';
import { derivePinnedMeals, isPinnableMeal, MAX_PINNED_MEALS, PINNED_MEALS_STORAGE_KEY, readPinnedMealIds, togglePinnedMealId, writePinnedMealIds } from './pinnedMeals';
import type { FoodMoment } from './types';

const meal = (id: string, title: string, category = 'breakfast', tags: string[] = []): FoodMoment => ({ id, title, category, tags } as FoodMoment);

describe('pinned meals', () => {
  it('preserves explicit pin order and exact mixed-script titles', () => {
    const moments = [meal('1', 'بيض مسلوق'), meal('2', 'Pain complet')];
    expect(derivePinnedMeals(moments, ['2', '1']).map(m => m.title)).toEqual(['Pain complet', 'بيض مسلوق']);
  });

  it('excludes demo, seed and blank meals', () => {
    expect(isPinnableMeal(meal('demo-1', 'Demo'))).toBe(false);
    expect(isPinnableMeal(meal('2', 'Seed', 'breakfast', ['seed']))).toBe(false);
    expect(isPinnableMeal(meal('3', '   '))).toBe(false);
  });

  it('deduplicates equivalent pinned meal identities without rewriting display text', () => {
    const moments = [meal('1', 'Couscous'), meal('2', ' couscous '), meal('3', 'Couscous', 'dinner')];
    expect(derivePinnedMeals(moments, ['2', '1', '3']).map(m => m.id)).toEqual(['2', '3']);
  });

  it('toggles pins and keeps the explicit set bounded', () => {
    let ids: string[] = [];
    for (let i = 1; i <= MAX_PINNED_MEALS + 1; i += 1) ids = togglePinnedMealId(ids, meal(String(i), `Meal ${i}`));
    expect(ids).toHaveLength(MAX_PINNED_MEALS);
    expect(ids[0]).toBe(String(MAX_PINNED_MEALS + 1));
    expect(togglePinnedMealId(ids, meal(ids[0], 'Meal'))).not.toContain(ids[0]);
  });

  it('persists a bounded unique id list and reads it back through the minimal storage contract', () => {
    let raw: string | null = null;
    const storage = { getItem: (key: string) => key === PINNED_MEALS_STORAGE_KEY ? raw : null, setItem: (_key: string, value: string) => { raw = value; } };
    const ids = writePinnedMealIds(['1', '1', '2', '3', '4', '5', '6'], storage);
    expect(ids).toEqual(['1', '2', '3', '4', '5']);
    expect(readPinnedMealIds(storage)).toEqual(ids);
  });

  it('fails closed when persisted pin state is malformed', () => {
    const storage = { getItem: () => '{broken' };
    expect(readPinnedMealIds(storage)).toEqual([]);
  });

  it('does not require browser storage when rendered outside the browser', () => {
    expect(readPinnedMealIds(undefined)).toEqual([]);
    expect(writePinnedMealIds(['1'], undefined)).toEqual(['1']);
  });
});
