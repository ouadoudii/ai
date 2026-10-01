import { describe, expect, it } from 'vitest';
import type { FoodMoment } from '../types';
import { getMealLoggingStreak } from './loggingStreak';

const moment = (id: string, date: string): FoodMoment => ({
  id,
  title: 'Meal',
  category: 'breakfast',
  date,
  time: '08:00',
  createdAt: 1,
} as FoodMoment);

describe('getMealLoggingStreak', () => {
  it('counts consecutive real local-date keys ending on the most recent logged day', () => {
    expect(getMealLoggingStreak([
      moment('a', '2026-09-28'),
      moment('b', '2026-09-29'),
      moment('c', '2026-09-30'),
      moment('d', '2026-10-01'),
    ])).toBe(4);
  });

  it('counts multiple meals on one day only once', () => {
    expect(getMealLoggingStreak([
      moment('a', '2026-09-30'),
      moment('b', '2026-10-01'),
      moment('c', '2026-10-01'),
    ])).toBe(2);
  });

  it('stops at the first missing date', () => {
    expect(getMealLoggingStreak([
      moment('old', '2026-09-27'),
      moment('recent-1', '2026-09-30'),
      moment('recent-2', '2026-10-01'),
    ])).toBe(2);
  });

  it('ignores demo and invalid dates', () => {
    expect(getMealLoggingStreak([
      moment('moment-1', '2026-10-01'),
      moment('bad', '2026-02-30'),
      moment('real', '2026-09-29'),
    ])).toBe(1);
  });

  it('returns zero without valid real history', () => {
    expect(getMealLoggingStreak([moment('moment-2', '2026-10-01')])).toBe(0);
  });
});
