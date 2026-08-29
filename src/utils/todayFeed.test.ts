import { describe, expect, it } from 'vitest';
import { FoodMoment } from '../types';
import { getRecentTodayMoments } from './todayFeed';

const baseMoment = (overrides: Partial<FoodMoment>): FoodMoment => ({
  id: 'moment',
  title: 'Moment',
  label: 'Snack',
  category: 'snack',
  date: '2026-08-29',
  time: '12:00',
  location: 'Home',
  locationCategory: 'home',
  imageUrl: '/placeholder.jpg',
  rating: 4,
  mood: 'satisfied',
  tags: [],
  createdAt: 1,
  ...overrides,
});

describe('getRecentTodayMoments', () => {
  it('keeps only today and shows the newest entries first without mutating input', () => {
    const moments = [
      baseMoment({ id: 'older', time: '08:00', createdAt: 10 }),
      baseMoment({ id: 'yesterday', date: '2026-08-28', time: '22:00', createdAt: 30 }),
      baseMoment({ id: 'newest', time: '18:00', createdAt: 20 }),
      baseMoment({ id: 'middle', time: '13:00', createdAt: 15 }),
      baseMoment({ id: 'extra', time: '09:00', createdAt: 11 }),
    ];

    const result = getRecentTodayMoments(moments, '2026-08-29', 3);

    expect(result.map((moment) => moment.id)).toEqual(['newest', 'middle', 'extra']);
    expect(moments.map((moment) => moment.id)).toEqual(['older', 'yesterday', 'newest', 'middle', 'extra']);
  });
});
