import { describe, expect, it } from 'vitest';
import type { DailyCheckIn, FoodMoment } from '../types';
import { CHECKIN_SOURCE_TAG, linkLegacyCheckInMeals } from './legacyCheckInMealLinks';

const checkIn = (overrides: Partial<DailyCheckIn> = {}): DailyCheckIn => ({
  id: 'user-checkin-1000', date: '2026-09-18', time: '20:15', timeOfDay: 'evening',
  food: { mealTitle: 'Harira', category: 'dinner' }, wellbeing: { energyLevel: 3, mood: 'satisfied' },
  createdAt: 1000, ...overrides,
});

const moment = (overrides: Partial<FoodMoment> = {}): FoodMoment => ({
  id: 'moment-1000', title: 'Harira', label: 'Dinner', category: 'dinner', date: '2026-09-18', time: '20:15',
  location: 'Home', locationCategory: 'home', imageUrl: '', rating: 5, mood: 'satisfied', tags: ['evening'], createdAt: 1000,
  ...overrides,
});

describe('legacy check-in meal source reconciliation', () => {
  it('backfills the exact pre-source-tag check-in moment', () => {
    const result = linkLegacyCheckInMeals([moment()], [checkIn()]);
    expect(result[0].tags).toContain(`${CHECKIN_SOURCE_TAG}user-checkin-1000`);
  });

  it('does not link a similar standalone meal with a different creation timestamp', () => {
    const standalone = moment({ id: 'manual', createdAt: 1001 });
    const result = linkLegacyCheckInMeals([standalone], [checkIn()]);
    expect(result[0].tags.some(tag => tag.startsWith(CHECKIN_SOURCE_TAG))).toBe(false);
  });

  it('leaves ambiguous exact historical matches untouched', () => {
    const first = moment({ id: 'legacy-a' });
    const second = moment({ id: 'legacy-b' });
    const result = linkLegacyCheckInMeals([first, second], [checkIn()]);
    expect(result.every(item => item.tags.every(tag => !tag.startsWith(CHECKIN_SOURCE_TAG)))).toBe(true);
  });

  it('does not alter already-linked moments', () => {
    const linked = moment({ tags: ['evening', `${CHECKIN_SOURCE_TAG}user-checkin-1000`] });
    expect(linkLegacyCheckInMeals([linked], [checkIn()])).toEqual([linked]);
  });
});
