import { describe, expect, it } from 'vitest';
import { averageRating, createMoment, toggleFavorite, type Moment } from './moments';

const moments: Moment[] = [
  { id: 1, title: 'A', meal: 'Lunch', note: '', favorite: false, rating: 4, date: 'Today' },
  { id: 2, title: 'B', meal: 'Dinner', note: '', favorite: true, rating: 5, date: 'Today' },
];

describe('moment helpers', () => {
  it('toggles only the selected favorite', () => {
    const result = toggleFavorite(moments, 1);
    expect(result[0].favorite).toBe(true);
    expect(result[1].favorite).toBe(true);
    expect(moments[0].favorite).toBe(false);
  });

  it('calculates a rounded average rating and handles empty input', () => {
    expect(averageRating(moments)).toBe(5);
    expect(averageRating([])).toBe(0);
  });

  it('creates a trimmed moment and rejects empty titles', () => {
    expect(createMoment('  Pasta  ', 123)).toMatchObject({
      id: 123,
      title: 'Pasta',
      favorite: false,
      rating: 5,
    });
    expect(createMoment('   ', 123)).toBeNull();
  });
});
