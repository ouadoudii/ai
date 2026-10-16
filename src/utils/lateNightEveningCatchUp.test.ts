import { describe, expect, it } from 'vitest';
import { DailyCheckIn } from '../types';
import {
  getLateNightEveningTarget,
  getPreviousLocalDateKey,
  LATE_NIGHT_CATCH_UP_END_HOUR,
} from './lateNightEveningCatchUp';

const checkIn = (date: string, timeOfDay: DailyCheckIn['timeOfDay'], id = `${date}-${timeOfDay}`): DailyCheckIn => ({
  id,
  date,
  time: '12:00',
  timeOfDay,
  wellbeing: {},
  createdAt: 1,
});

describe('late-night previous-evening catch-up', () => {
  it('offers the incomplete previous day between midnight and 04:59', () => {
    const now = new Date(2026, 9, 16, 2, 0);
    const previousDate = getPreviousLocalDateKey(now);

    expect(getLateNightEveningTarget(now, [checkIn(previousDate, 'morning'), checkIn(previousDate, 'midday')]))
      .toBe(previousDate);
  });

  it('does not offer a catch-up once the previous evening is complete', () => {
    const now = new Date(2026, 9, 16, 0, 1);
    const previousDate = getPreviousLocalDateKey(now);

    expect(getLateNightEveningTarget(now, [checkIn(previousDate, 'evening')])).toBeNull();
  });

  it('does not invent a previous day when that day has no real check-ins', () => {
    const now = new Date(2026, 9, 16, 2, 0);
    const previousDate = getPreviousLocalDateKey(now);

    expect(getLateNightEveningTarget(now, [])).toBeNull();
    expect(getLateNightEveningTarget(now, [checkIn(previousDate, 'midday', 'seed')], new Set(['seed']))).toBeNull();
  });

  it('ends the grace window exactly at 05:00', () => {
    const now = new Date(2026, 9, 16, LATE_NIGHT_CATCH_UP_END_HOUR, 0);
    const previousDate = getPreviousLocalDateKey(now);

    expect(getLateNightEveningTarget(now, [checkIn(previousDate, 'midday')])).toBeNull();
  });

  it('uses calendar subtraction across month and year boundaries', () => {
    expect(getPreviousLocalDateKey(new Date(2027, 0, 1, 2, 0))).toBe('2026-12-31');
    expect(getPreviousLocalDateKey(new Date(2026, 2, 1, 2, 0))).toBe('2026-02-28');
  });
});
