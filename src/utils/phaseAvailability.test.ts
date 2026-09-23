import { describe, expect, it } from 'vitest';
import { getAvailableMealCategories, getAvailablePhases, getCurrentPhase, isMealCategoryAvailable, isPhaseAvailable } from './phaseAvailability';

describe('phase availability', () => {
  it('does not expose future day phases', () => {
    expect(getAvailablePhases(10)).toEqual(['morning']);
    expect(getAvailablePhases(13)).toEqual(['morning','midday']);
    expect(getAvailablePhases(18)).toEqual(['morning','midday','evening']);
  });

  it('blocks future main meals while keeping flexible moments available', () => {
    expect(isMealCategoryAvailable('lunch', 10)).toBe(false);
    expect(isMealCategoryAvailable('dinner', 16)).toBe(false);
    expect(isMealCategoryAvailable('dinner', 17)).toBe(false);
    expect(isMealCategoryAvailable('dinner', 18)).toBe(true);
    expect(isMealCategoryAvailable('snack', 10)).toBe(true);
    expect(getAvailableMealCategories(12, ['breakfast','lunch','dinner','snack'])).toEqual(['breakfast','lunch','snack']);
  });

  it.each([
    [5, 'morning'],
    [10, 'morning'],
    [11, 'midday'],
    [15, 'midday'],
    [16, 'midday'],
    [17, 'midday'],
    [18, 'evening'],
    [23, 'evening'],
  ] as const)('resolves hour %s with the shared phase policy', (hour, expected) => {
    expect(getCurrentPhase(hour)).toBe(expected);
  });

  it('keeps the current phase aligned with evening availability at the disputed boundary', () => {
    for (const hour of [16, 17, 18]) {
      expect(getCurrentPhase(hour) === 'evening').toBe(isPhaseAvailable('evening', hour));
    }
  });
});