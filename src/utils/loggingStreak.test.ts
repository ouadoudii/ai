import { describe, expect, it } from 'vitest';
import { deriveMealLoggingStreak } from './loggingStreak';
import { FoodMoment } from '../types';

const meal = (id: string, date: string, tags: string[] = []): FoodMoment => ({
  id, date, tags, title: 'بيض + pain', label: 'Breakfast', category: 'breakfast', time: '08:00',
  location: '', imageUrl: '', rating: 0, mood: 'neutral', createdAt: 1,
});

describe('deriveMealLoggingStreak', () => {
  it('counts consecutive unique real dates ending at the latest logged day', () => {
    expect(deriveMealLoggingStreak([
      meal('a', '2026-09-28'), meal('b', '2026-09-29'), meal('c', '2026-09-30'), meal('d', '2026-09-30'),
    ])).toBe(3);
  });

  it('stops at a gap rather than fabricating continuity', () => {
    expect(deriveMealLoggingStreak([meal('a', '2026-09-27'), meal('b', '2026-09-29'), meal('c', '2026-09-30')])).toBe(2);
  });

  it('ignores demo, simulated, seeded and invalid dates', () => {
    expect(deriveMealLoggingStreak([
      meal('real', '2026-09-30'), meal('demo-1', '2026-09-29'), meal('sim-1', '2026-09-28'),
      meal('seeded', '2026-09-29', ['seed']), meal('bad', '2026-02-31'),
    ])).toBe(1);
  });

  it('returns zero for no valid real history', () => {
    expect(deriveMealLoggingStreak([meal('demo-1', '2026-09-30')])).toBe(0);
  });
});
