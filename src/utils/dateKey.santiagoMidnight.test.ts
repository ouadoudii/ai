import { describe, expect, it } from 'vitest';
import { getLocalDateKey } from './dateKey';

describe('getLocalDateKey Santiago midnight DST regressions', () => {
  it('advances the calendar day when Santiago skips local midnight in spring', () => {
    expect(getLocalDateKey(new Date('2026-09-06T03:59:59.999Z'), 'America/Santiago')).toBe('2026-09-05');
    expect(getLocalDateKey(new Date('2026-09-06T04:00:00.000Z'), 'America/Santiago')).toBe('2026-09-06');
    expect(getLocalDateKey(new Date('2026-09-06T03:59:59.999Z'), 'UTC')).toBe('2026-09-06');
  });

  it('does not create an extra date when Santiago repeats the hour before midnight in autumn', () => {
    expect(getLocalDateKey(new Date('2026-04-05T02:59:59.999Z'), 'America/Santiago')).toBe('2026-04-04');
    expect(getLocalDateKey(new Date('2026-04-05T03:00:00.000Z'), 'America/Santiago')).toBe('2026-04-04');
    expect(getLocalDateKey(new Date('2026-04-05T03:59:59.999Z'), 'America/Santiago')).toBe('2026-04-04');
    expect(getLocalDateKey(new Date('2026-04-05T04:00:00.000Z'), 'America/Santiago')).toBe('2026-04-05');
  });

  it('uses distinct Santiago midnight UTC offsets at winter month-end and summer New Year', () => {
    expect(getLocalDateKey(new Date('2026-07-01T03:59:59.999Z'), 'America/Santiago')).toBe('2026-06-30');
    expect(getLocalDateKey(new Date('2026-07-01T04:00:00.000Z'), 'America/Santiago')).toBe('2026-07-01');
    expect(getLocalDateKey(new Date('2026-01-01T02:59:59.999Z'), 'America/Santiago')).toBe('2025-12-31');
    expect(getLocalDateKey(new Date('2026-01-01T03:00:00.000Z'), 'America/Santiago')).toBe('2026-01-01');
  });
});
