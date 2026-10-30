import { describe, expect, it } from 'vitest';
import { hasExplicitMealRating } from './mealRating';

describe('meal rating evidence', () => {
  it('does not invent a rating for an omitted, null or invalid value', () => {
    for (const rating of [undefined, null, NaN, Infinity, -1, 0, 6]) {
      expect(hasExplicitMealRating(rating)).toBe(false);
    }
  });

  it('preserves explicitly recorded historical ratings', () => {
    for (const rating of [1, 2, 3, 4, 4.5, 5]) {
      expect(hasExplicitMealRating(rating)).toBe(true);
    }
  });
});
