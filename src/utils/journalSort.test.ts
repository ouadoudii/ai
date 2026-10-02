import { describe, expect, it } from 'vitest';
import type { FoodMoment } from '../types';
import { sortJournalMoments } from './journalSort';

const moment = (id: string, date: string, time: string): FoodMoment => ({
  id,
  date,
  time,
  title: id,
  category: 'breakfast',
  location: '',
  rating: 0,
  mood: 'satisfied',
  tags: [],
  createdAt: `${date}T${time || '00:00'}:00`,
} as FoodMoment);

describe('sortJournalMoments', () => {
  const history = [
    moment('old-morning', '2026-09-01', '08:00'),
    moment('new-evening', '2026-09-03', '20:00'),
    moment('new-morning', '2026-09-03', '07:30'),
  ];

  it('defaults to newest day and latest known time first', () => {
    expect(sortJournalMoments(history).map(item => item.id)).toEqual([
      'new-evening', 'new-morning', 'old-morning',
    ]);
  });

  it('supports oldest-first without mutating persisted input order', () => {
    const original = history.map(item => item.id);
    expect(sortJournalMoments(history, 'oldest').map(item => item.id)).toEqual([
      'old-morning', 'new-morning', 'new-evening',
    ]);
    expect(history.map(item => item.id)).toEqual(original);
  });

  it('keeps unknown times deterministic without inventing a clock value', () => {
    const items = [moment('unknown', '2026-09-03', ''), moment('known', '2026-09-03', '12:15')];
    expect(sortJournalMoments(items, 'newest').map(item => item.id)).toEqual(['known', 'unknown']);
    expect(items[0].time).toBe('');
  });
});
