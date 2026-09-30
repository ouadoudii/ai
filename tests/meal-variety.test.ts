import { describe, expect, it } from 'vitest';
import { getMealVarietyInsight } from '../src/utils/mealVariety';
import type { FoodMoment } from '../src/types';

const meal = (id: string, title: string, createdAt: number): FoodMoment => ({
  id, title, label: title, category: 'lunch', date: '2026-09-29', time: '12:00', location: '',
  locationCategory: 'home', imageUrl: '', mood: 'satisfied', tags: [], createdAt,
});

describe('getMealVarietyInsight', () => {
  it('counts normalized distinct titles across the most recent real meals', () => {
    const result = getMealVarietyInsight([
      meal('real-1', 'Couscous', 10),
      meal('real-2', ' couscous ', 20),
      meal('real-3', 'COUSCOUS', 30),
      meal('real-4', 'Harira', 40),
      meal('real-5', 'Eggs', 50),
      meal('real-6', 'Salad', 60),
    ]);
    expect(result).toEqual({ mealCount: 6, distinctMealCount: 4, distinctRatio: 4 / 6 });
  });

  it('excludes demo and blank meals and returns no claim for sparse history', () => {
    expect(getMealVarietyInsight([
      meal('moment-1', 'Demo', 100),
      meal('moment-2', 'Demo two', 90),
      meal('real-1', 'Soup', 80),
      meal('real-2', 'Bread', 70),
      meal('real-3', '   ', 60),
    ])).toBeNull();
  });

  it('uses only the configured most-recent window deterministically', () => {
    const moments = Array.from({ length: 12 }, (_, index) => meal(`real-${index}`, index < 2 ? 'Old meal' : `Meal ${index}`, index));
    const result = getMealVarietyInsight(moments, 10, 6);
    expect(result).toEqual({ mealCount: 10, distinctMealCount: 10, distinctRatio: 1 });
  });
});
