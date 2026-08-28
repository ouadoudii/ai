import { describe, expect, it } from 'vitest';
import { addCheckIn, createCheckIn, hasCheckInToday, latestCheckIn } from './checkins';

describe('daily check-ins', () => {
  it('creates a check-in with the selected mood', () => {
    const now = new Date('2026-08-28T08:30:00.000Z');
    expect(createCheckIn('calm', now)).toEqual({
      mood: 'calm',
      createdAt: '2026-08-28T08:30:00.000Z',
    });
  });

  it('adds the newest check-in first', () => {
    const old = createCheckIn('neutral', new Date('2026-08-27T10:00:00.000Z'));
    const result = addCheckIn([old], 'good', new Date('2026-08-28T10:00:00.000Z'));
    expect(result.map(item => item.mood)).toEqual(['good', 'neutral']);
    expect(latestCheckIn(result)?.mood).toBe('good');
  });

  it('detects whether today already has a check-in', () => {
    const checkIns = [createCheckIn('low', new Date('2026-08-28T07:00:00.000Z'))];
    expect(hasCheckInToday(checkIns, new Date('2026-08-28T20:00:00.000Z'))).toBe(true);
    expect(hasCheckInToday(checkIns, new Date('2026-08-29T08:00:00.000Z'))).toBe(false);
  });
});
