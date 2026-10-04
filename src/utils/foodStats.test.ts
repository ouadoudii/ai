import { describe, expect, it } from 'vitest';
import { FoodMoment } from '../types';
import { getAverageRating, getLocationStats } from './foodStats';

const moment = (overrides: Partial<FoodMoment> = {}): FoodMoment => ({
  id: 'm', title: 'Meal', label: 'Meal', category: 'lunch', date: '2026-10-01', time: '12:00',
  location: '', locationCategory: 'travel', imageUrl: '', mood: 'satisfied', tags: [], createdAt: 1,
  ...overrides,
});

describe('truthful food statistics', () => {
  it('does not classify unknown, travel, or takeaway locations as restaurants', () => {
    const legacyUnknown = { ...moment({ id: 'unknown' }), locationCategory: undefined } as unknown as FoodMoment;
    expect(getLocationStats([
      moment({ id: 'home', locationCategory: 'home' }),
      moment({ id: 'restaurant', locationCategory: 'restaurant' }),
      moment({ id: 'cafe', locationCategory: 'cafe' }),
      moment({ id: 'travel', locationCategory: 'travel' }),
      moment({ id: 'takeaway', locationCategory: 'takeaway' }),
      legacyUnknown,
    ])).toEqual({ home: 1, restaurant: 2, unknown: 3 });
  });

  it('averages only ratings the user actually supplied', () => {
    expect(getAverageRating([
      moment({ id: 'rated-1', rating: 5 }),
      moment({ id: 'unrated', rating: undefined }),
      moment({ id: 'rated-2', rating: 3 }),
    ])).toBe('4.0');
    expect(getAverageRating([moment({ rating: undefined })])).toBe('0.0');
  });
});
