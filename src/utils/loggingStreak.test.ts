import { describe, expect, it } from 'vitest';
import type { FoodMoment } from '../types';
import { getBestMealLoggingStreak, getMealLoggingStreak } from './loggingStreak';

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

describe('getBestMealLoggingStreak', () => {
  it('returns the longest historical run even when the latest run is shorter', () => {
    expect(getBestMealLoggingStreak([
      moment('recent-2', '2026-10-01'),
      moment('old-2', '2026-09-21'),
      moment('old-1', '2026-09-20'),
      moment('recent-1', '2026-09-30'),
      moment('old-4', '2026-09-23'),
      moment('old-3', '2026-09-22'),
    ])).toBe(4);
  });

  it('counts duplicate same-day meals once', () => {
    expect(getBestMealLoggingStreak([
      moment('a', '2026-09-20'),
      moment('b', '2026-09-21'),
      moment('c', '2026-09-21'),
      moment('d', '2026-09-22'),
    ])).toBe(3);
  });

  it('ignores demo and invalid dates and returns zero without real history', () => {
    expect(getBestMealLoggingStreak([
      moment('moment-1', '2026-09-20'),
      moment('bad', '2026-02-30'),
    ])).toBe(0);
  });
});
