import { describe, expect, it } from 'vitest';
import { LIMITS, cleanText, safeArray } from '../api/security';

describe('Cary API security helpers', () => {
  it('rejects oversized and empty text input', () => {
    expect(cleanText('   ', 10)).toBeNull();
    expect(cleanText('a'.repeat(11), 10)).toBeNull();
    expect(cleanText('  hello  ', 10)).toBe('hello');
  });

  it('strips null bytes from accepted text', () => {
    expect(cleanText('hel\u0000lo', 10)).toBe('hello');
  });

  it('rejects non-arrays and oversized arrays', () => {
    expect(safeArray({}, 2)).toBeNull();
    expect(safeArray([1, 2, 3], 2)).toBeNull();
    expect(safeArray([1, 2], 2)).toEqual([1, 2]);
  });

  it('keeps conservative public API limits', () => {
    expect(LIMITS.transcript).toBeLessThanOrEqual(4000);
    expect(LIMITS.query).toBeLessThanOrEqual(2000);
    expect(LIMITS.moments).toBeLessThanOrEqual(100);
    expect(LIMITS.checkIns).toBeLessThanOrEqual(100);
  });
});
