import { describe, expect, it } from 'vitest';
import type { FoodMoment, MomentCategory } from './types';
import { deriveUsualMealTime } from './usualMealTime';

const meal = (id: string, time: string, category: MomentCategory = 'lunch', tags: string[] = []): FoodMoment => ({
  id, title: 'بيض مسلوق + pain complet', label: 'meal', category, date: '2026-09-30', time,
  location: '', locationCategory: 'home', imageUrl: '', mood: 'satisfied', tags, createdAt: 1,
});

describe('deriveUsualMealTime', () => {
  it('derives a stable typical time from explicit real history', () => {
    expect(deriveUsualMealTime([meal('1','12:20'), meal('2','12:40'), meal('3','12:30')], 'lunch')).toBe('12:30');
  });

  it('requires enough observations and ignores invalid/demo/other-category data', () => {
    const moments = [meal('1','12:30'), meal('2','12:40'), meal('demo-3','12:35'), meal('4','bad'), meal('5','08:00','breakfast')];
    expect(deriveUsualMealTime(moments, 'lunch')).toBeNull();
  });

  it('handles meals around midnight without incorrectly averaging to noon', () => {
    expect(deriveUsualMealTime([meal('1','23:50','snack'), meal('2','00:10','snack'), meal('3','00:00','snack')], 'snack')).toBe('00:00');
  });

  it('does not mutate mixed-language user-authored meal data', () => {
    const moments = [meal('1','08:00','breakfast'), meal('2','08:10','breakfast'), meal('3','08:20','breakfast')];
    const before = JSON.stringify(moments);
    expect(deriveUsualMealTime(moments, 'breakfast')).toBe('08:10');
    expect(JSON.stringify(moments)).toBe(before);
    expect(moments[0].title).toBe('بيض مسلوق + pain complet');
  });
});
