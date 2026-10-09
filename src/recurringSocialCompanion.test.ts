import { describe, expect, it } from 'vitest';
import type { FoodMoment } from './types';
import { deriveRecurringSocialCompanion } from './recurringSocialCompanion';

const meal = (id: string, companions: string, createdAt: number, overrides: Partial<FoodMoment> = {}): FoodMoment => ({
  id,
  title: 'بيض مسلوق',
  label: 'Breakfast',
  category: 'breakfast',
  date: '2026-10-01',
  time: '08:00',
  location: '',
  locationCategory: 'home',
  imageUrl: '',
  mood: 'satisfied',
  tags: [],
  companions,
  createdAt,
  ...overrides,
});

describe('deriveRecurringSocialCompanion', () => {
  it('returns a unique companion after three real same-category observations', () => {
    const result = deriveRecurringSocialCompanion([
      meal('1', 'Sara', 1), meal('2', 'Sara', 2), meal('3', 'Sara', 3),
    ], 'breakfast');
    expect(result).toEqual({ companion: 'Sara', count: 3, category: 'breakfast' });
  });

  it('normalizes accents and Arabic harakat for comparison while preserving latest exact spelling', () => {
    const result = deriveRecurringSocialCompanion([
      meal('1', 'أُمّي', 1), meal('2', 'أمي', 2), meal('3', 'أُمّي', 3),
    ], 'breakfast');
    expect(result?.companion).toBe('أُمّي');
    expect(result?.count).toBe(3);
  });

  it('ignores demo data, blanks, and other meal categories', () => {
    const result = deriveRecurringSocialCompanion([
      meal('1', 'Youssef', 1),
      meal('2', 'Youssef', 2),
      meal('demo-3', 'Youssef', 3, { tags: ['demo'] }),
      meal('4', 'Youssef', 4, { category: 'lunch' }),
      meal('5', ' ', 5),
    ], 'breakfast');
    expect(result).toBeNull();
  });

  it('does not guess when qualifying companions are tied', () => {
    const moments = [
      meal('1', 'Sara', 1), meal('2', 'Sara', 2), meal('3', 'Sara', 3),
      meal('4', 'Omar', 4), meal('5', 'Omar', 5), meal('6', 'Omar', 6),
    ];
    expect(deriveRecurringSocialCompanion(moments, 'breakfast')).toBeNull();
  });
});
