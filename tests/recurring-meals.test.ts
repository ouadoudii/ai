import { describe, expect, it } from 'vitest';
import { getRecurringMeals } from '../src/utils/recurringMeals';
import type { FoodMoment } from '../src/types';

const meal = (id: string, title: string, createdAt: number): FoodMoment => ({
  id, title, label: title, category: 'lunch', date: '2026-09-29', time: '12:00', location: '',
  locationCategory: 'home', imageUrl: '', mood: 'satisfied', tags: [], createdAt,
});

describe('getRecurringMeals', () => {
  it('groups casing/whitespace, preserves newest display title and ranks by count', () => {
    const result = getRecurringMeals([
      meal('real-1', 'Couscous', 10), meal('real-2', ' couscous ', 20), meal('real-3', 'COUSCOUS', 30),
      meal('real-4', 'Harira', 40), meal('real-5', 'Harira', 50), meal('real-6', 'One off', 60),
    ]);
    expect(result).toEqual([
      { title: 'COUSCOUS', count: 3, latestCreatedAt: 30 },
      { title: 'Harira', count: 2, latestCreatedAt: 50 },
    ]);
  });

  it('excludes demo moments and breaks equal-count ties by latest occurrence', () => {
    const result = getRecurringMeals([
      meal('moment-1', 'Demo', 999), meal('moment-2', 'Demo', 998),
      meal('real-a1', 'Eggs', 10), meal('real-a2', 'Eggs', 20),
      meal('real-b1', 'Soup', 30), meal('real-b2', 'Soup', 40),
    ]);
    expect(result.map(({ title }) => title)).toEqual(['Soup', 'Eggs']);
  });
});
