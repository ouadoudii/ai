import { describe, expect, it } from 'vitest';
import { getLocalDateKey } from './dateKey';

describe('getLocalDateKey timezone and DST regressions', () => {
  it('uses the next Berlin calendar day before the spring clock change', () => {
    expect(getLocalDateKey(new Date('2026-03-28T23:30:00.000Z'), 'Europe/Berlin')).toBe('2026-03-29');
    expect(getLocalDateKey(new Date('2026-03-29T00:30:00.000Z'), 'Europe/Berlin')).toBe('2026-03-29');
  });

  it('keeps the same Berlin date across the skipped spring hour', () => {
    expect(getLocalDateKey(new Date('2026-03-29T00:59:59.000Z'), 'Europe/Berlin')).toBe('2026-03-29');
    expect(getLocalDateKey(new Date('2026-03-29T01:00:00.000Z'), 'Europe/Berlin')).toBe('2026-03-29');
    expect(getLocalDateKey(new Date('2026-03-29T22:30:00.000Z'), 'Europe/Berlin')).toBe('2026-03-30');
  });

  it('keeps the same Berlin date through the repeated autumn hour', () => {
    expect(getLocalDateKey(new Date('2026-10-25T00:30:00.000Z'), 'Europe/Berlin')).toBe('2026-10-25');
    expect(getLocalDateKey(new Date('2026-10-25T01:30:00.000Z'), 'Europe/Berlin')).toBe('2026-10-25');
    expect(getLocalDateKey(new Date('2026-10-25T23:30:00.000Z'), 'Europe/Berlin')).toBe('2026-10-26');
  });

  it('does not use the UTC day for New York at the spring transition', () => {
    expect(getLocalDateKey(new Date('2026-03-08T04:59:00.000Z'), 'America/New_York')).toBe('2026-03-07');
    expect(getLocalDateKey(new Date('2026-03-08T06:59:59.000Z'), 'America/New_York')).toBe('2026-03-08');
    expect(getLocalDateKey(new Date('2026-03-08T07:00:00.000Z'), 'America/New_York')).toBe('2026-03-08');
  });

  it('keeps the New York date stable through the repeated autumn hour', () => {
    expect(getLocalDateKey(new Date('2026-11-01T05:30:00.000Z'), 'America/New_York')).toBe('2026-11-01');
    expect(getLocalDateKey(new Date('2026-11-01T06:30:00.000Z'), 'America/New_York')).toBe('2026-11-01');
  });

  it('distinguishes calendar dates across the international date line and year end', () => {
    const instant = new Date('2026-12-31T10:30:00.000Z');
    expect(getLocalDateKey(instant, 'Pacific/Kiritimati')).toBe('2027-01-01');
    expect(getLocalDateKey(instant, 'Pacific/Honolulu')).toBe('2026-12-31');
    expect(getLocalDateKey(instant, 'UTC')).toBe('2026-12-31');
  });

  it('preserves leap-day dates rather than rolling into March', () => {
    const instant = new Date('2028-02-29T00:30:00.000Z');
    expect(getLocalDateKey(instant, 'Europe/Berlin')).toBe('2028-02-29');
    expect(getLocalDateKey(instant, 'America/New_York')).toBe('2028-02-28');
  });

  it('uses the device local calendar date when no timezone is supplied', () => {
    expect(getLocalDateKey(new Date(2026, 9, 18, 23, 59, 59))).toBe('2026-10-18');
  });

  it('rejects an unknown timezone instead of silently using UTC', () => {
    expect(() => getLocalDateKey(new Date('2026-10-18T12:00:00.000Z'), 'Not/A_Timezone')).toThrow(RangeError);
  });

  it('rejects an invalid instant instead of returning a malformed storage key', () => {
    expect(() => getLocalDateKey(new Date(Number.NaN), 'UTC')).toThrow(RangeError);
  });
});
