import { describe, expect, it } from 'vitest';
import { getLocalDateKey } from './dateKey';

describe('getLocalDateKey', () => {
  it('uses the requested local timezone across a UTC date boundary', () => {
    const instant = new Date('2026-08-28T22:30:00.000Z');

    expect(getLocalDateKey(instant, 'Europe/Berlin')).toBe('2026-08-29');
    expect(getLocalDateKey(instant, 'America/New_York')).toBe('2026-08-28');
  });

  it('always returns the YYYY-MM-DD storage format', () => {
    const value = getLocalDateKey(new Date('2026-01-05T12:00:00.000Z'), 'UTC');
    expect(value).toBe('2026-01-05');
  });
});
