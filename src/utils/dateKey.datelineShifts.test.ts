import { describe, expect, it } from 'vitest';
import { getLocalDateKey } from './dateKey';

describe('getLocalDateKey historical international date-line shifts', () => {
  it('skips the nonexistent December 30, 2011 in Samoa at the exact transition', () => {
    expect(getLocalDateKey(new Date('2011-12-30T09:59:59.999Z'), 'Pacific/Apia')).toBe('2011-12-29');
    expect(getLocalDateKey(new Date('2011-12-30T10:00:00.000Z'), 'Pacific/Apia')).toBe('2011-12-31');
    expect(getLocalDateKey(new Date('2011-12-30T10:00:00.000Z'), 'UTC')).toBe('2011-12-30');
  });

  it('continues normally into New Year after the Samoa date-line change', () => {
    expect(getLocalDateKey(new Date('2011-12-31T09:59:59.999Z'), 'Pacific/Apia')).toBe('2011-12-31');
    expect(getLocalDateKey(new Date('2011-12-31T10:00:00.000Z'), 'Pacific/Apia')).toBe('2012-01-01');
  });

  it('skips the nonexistent August 21, 1993 in Kwajalein without affecting UTC', () => {
    expect(getLocalDateKey(new Date('1993-08-21T11:59:59.999Z'), 'Pacific/Kwajalein')).toBe('1993-08-20');
    expect(getLocalDateKey(new Date('1993-08-21T12:00:00.000Z'), 'Pacific/Kwajalein')).toBe('1993-08-22');
    expect(getLocalDateKey(new Date('1993-08-21T12:00:00.000Z'), 'UTC')).toBe('1993-08-21');
  });

  it('skips New Year Eve 1994 in Kiritimati but preserves dates in other zones', () => {
    const before = new Date('1994-12-31T09:59:59.999Z');
    const after = new Date('1994-12-31T10:00:00.000Z');
    expect(getLocalDateKey(before, 'Pacific/Kiritimati')).toBe('1994-12-30');
    expect(getLocalDateKey(after, 'Pacific/Kiritimati')).toBe('1995-01-01');
    expect(getLocalDateKey(after, 'UTC')).toBe('1994-12-31');
    expect(getLocalDateKey(after, 'Pacific/Honolulu')).toBe('1994-12-31');
  });
});
