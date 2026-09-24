import { describe, expect, it } from 'vitest';
import { mergeVoiceMoments } from '../src/utils/voiceJournalState';
import type { FoodMoment } from '../src/types';

const moment = (id: string, time: string): FoodMoment => ({
  id,
  title: 'Kaffee',
  label: 'Kaffee',
  category: 'coffee',
  date: '2026-09-24',
  time,
  location: '',
  imageUrl: '',
  rating: 5,
  mood: 'satisfied',
  createdAt: id === 'first' ? 1 : 2,
} as FoodMoment);

describe('voice journal repeated occurrences', () => {
  it('preserves a later same-title occurrence when its exact time is unknown', () => {
    const merged = mergeVoiceMoments([moment('first', '09:00')], [moment('second', '')]);
    expect(merged).toHaveLength(2);
    expect(merged.map(item => item.id)).toEqual(['second', 'first']);
  });

  it('preserves a timed occurrence when the earlier same-title occurrence is untimed', () => {
    const merged = mergeVoiceMoments([moment('first', '')], [moment('second', '15:00')]);
    expect(merged).toHaveLength(2);
  });

  it('still merges an exact same-title, same-time restatement', () => {
    const merged = mergeVoiceMoments([moment('first', '09:00')], [moment('second', '09:00')]);
    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe('first');
  });

  it('keeps two explicit different times as separate occurrences', () => {
    const merged = mergeVoiceMoments([moment('first', '09:00')], [moment('second', '15:00')]);
    expect(merged).toHaveLength(2);
  });
});
