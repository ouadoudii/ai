import { describe, expect, it } from 'vitest';
import { resolveMealMomentTime } from '../src/utils/mealMomentTime';

describe('resolveMealMomentTime', () => {
  it('preserves an unknown time while editing', () => {
    expect(resolveMealMomentTime(undefined, '14:35', true)).toBeUndefined();
  });

  it('preserves an existing time while editing', () => {
    expect(resolveMealMomentTime('12:10', '14:35', true)).toBe('12:10');
  });

  it('uses the current time for a new meal', () => {
    expect(resolveMealMomentTime(undefined, '14:35', false)).toBe('14:35');
  });
});
