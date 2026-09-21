import { describe, expect, it } from 'vitest';
import { getCanonicalLocalTime } from './components/DailyCheckInModal';

describe('Daily Check-In canonical local time', () => {
  it('stores a locale-independent 24-hour HH:mm value', () => {
    const date = new Date(2026, 8, 21, 15, 5);
    expect(getCanonicalLocalTime(date)).toBe('15:05');
  });

  it('keeps midnight and noon unambiguous', () => {
    expect(getCanonicalLocalTime(new Date(2026, 8, 21, 0, 5))).toBe('00:05');
    expect(getCanonicalLocalTime(new Date(2026, 8, 21, 12, 0))).toBe('12:00');
    expect(getCanonicalLocalTime(new Date(2026, 8, 21, 23, 59))).toBe('23:59');
  });
});
