import { describe, expect, it } from 'vitest';
import type { FoodMoment } from '../src/types';
import { getMealRhythmShift } from '../src/utils/mealRhythmShift';

const meal = (id: string, time: string, createdAt: number, category: FoodMoment['category'] = 'lunch'): FoodMoment => ({
  id, title: 'Lunch', label: 'Lunch', category, date: '2026-09-29', time,
  location: '', locationCategory: 'home', imageUrl: '', mood: 'satisfied', tags: [], createdAt,
});

describe('getMealRhythmShift', () => {
  it('detects a meaningful later shift from recent explicit meal times', () => {
    const moments = [
      meal('recent-3', '14:10', 60), meal('recent-2', '14:00', 50), meal('recent-1', '13:50', 40),
      meal('base-3', '12:35', 30), meal('base-2', '12:30', 20), meal('base-1', '12:25', 10),
    ];
    expect(getMealRhythmShift(moments)).toMatchObject({ category: 'lunch', recentMinutes: 840, baselineMinutes: 750, deltaMinutes: 90 });
  });

  it('returns null for thin or stable histories', () => {
    expect(getMealRhythmShift([meal('1', '13:00', 3), meal('2', '12:50', 2)])).toBeNull();
    const stable = ['12:45', '12:40', '12:35', '12:30', '12:25', '12:20'].map((time, index) => meal(String(index), time, 10 - index));
    expect(getMealRhythmShift(stable)).toBeNull();
  });

  it('ignores demo entries and moments without explicit valid times', () => {
    const noisy = [
      meal('demo-late', '18:00', 100), meal('seed-late', '18:00', 99), meal('unknown', '', 98),
      meal('1', '13:00', 6), meal('2', '13:00', 5), meal('3', '13:00', 4),
      meal('4', '12:50', 3), meal('5', '12:50', 2), meal('6', '12:50', 1),
    ];
    expect(getMealRhythmShift(noisy)).toBeNull();
  });
});
