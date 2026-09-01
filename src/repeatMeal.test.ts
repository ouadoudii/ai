import { describe, expect, it } from 'vitest';
import { getRepeatCandidates, repeatMeal } from './utils/repeatMeal';
import type { FoodMoment } from './types';

describe('one-tap meal repeat', () => {
  it('ignores demo items and deduplicates same title/category', () => {
    const moments = [
      { id: 'moment-1', title: 'Demo', category: 'breakfast', createdAt: 99 },
      { id: 'u1', title: 'Haferbrei', category: 'breakfast', createdAt: 100 },
      { id: 'u2', title: 'Haferbrei', category: 'breakfast', createdAt: 200 },
      { id: 'u3', title: 'Salat', category: 'lunch', createdAt: 150 },
    ] as FoodMoment[];
    const result = getRepeatCandidates(moments);
    expect(result.map((m) => m.id)).toEqual(['u2', 'u3']);
  });

  it('copies a meal to today with a new id and time', () => {
    const source = { id: 'u1', title: 'Haferbrei', category: 'breakfast', date: '2026-08-30', time: '08:00', tags: [] } as FoodMoment;
    const repeated = repeatMeal(source, new Date('2026-09-01T09:15:00'));
    expect(repeated.id).not.toBe(source.id);
    expect(repeated.date).toBe('2026-09-01');
    expect(repeated.time).toBe('09:15');
    expect(repeated.tags).toContain('Wiederholt');
  });
});
