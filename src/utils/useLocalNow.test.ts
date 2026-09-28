import { describe, expect, it } from 'vitest';
import { nextMinuteDelay, shouldRefreshLocalClock } from './useLocalNow';

describe('reactive local clock', () => {
  it('schedules the next refresh at the next local minute boundary', () => {
    expect(nextMinuteDelay(new Date(2026, 8, 27, 23, 59, 0, 0))).toBe(60_000);
    expect(nextMinuteDelay(new Date(2026, 8, 27, 23, 59, 42, 250))).toBe(17_750);
  });

  it('refreshes on return only when the document is visible', () => {
    expect(shouldRefreshLocalClock('visible')).toBe(true);
    expect(shouldRefreshLocalClock('hidden')).toBe(false);
  });
});
