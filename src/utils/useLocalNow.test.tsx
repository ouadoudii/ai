import { describe, expect, it } from 'vitest';
import { getLocalDateKey } from './dateKey';
import { nextMinuteDelay, shouldRefreshLocalClock } from './useLocalNow';

describe('local clock rollover helpers', () => {
  it('schedules the next refresh across local midnight', () => {
    const beforeMidnight = new Date(2026, 8, 27, 23, 59, 59, 900);
    expect(getLocalDateKey(beforeMidnight)).toBe('2026-09-27');
    expect(nextMinuteDelay(beforeMidnight)).toBe(100);

    const afterTick = new Date(beforeMidnight.getTime() + nextMinuteDelay(beforeMidnight));
    expect(getLocalDateKey(afterTick)).toBe('2026-09-28');
    expect(afterTick.getHours()).toBe(0);
  });

  it('refreshes a foreground app but not a hidden one', () => {
    expect(shouldRefreshLocalClock('visible')).toBe(true);
    expect(shouldRefreshLocalClock('hidden')).toBe(false);
  });
});
