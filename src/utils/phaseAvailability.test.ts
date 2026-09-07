import { describe, expect, it } from 'vitest';
import { getAvailableMealCategories, getAvailablePhases, isMealCategoryAvailable } from './phaseAvailability';

describe('phase availability', () => {
  it('does not expose future day phases', () => {
    expect(getAvailablePhases(10)).toEqual(['morning']);
    expect(getAvailablePhases(13)).toEqual(['morning','midday']);
    expect(getAvailablePhases(18)).toEqual(['morning','midday','evening']);
  });

  it('blocks future main meals while keeping flexible moments available', () => {
    expect(isMealCategoryAvailable('lunch', 10)).toBe(false);
    expect(isMealCategoryAvailable('dinner', 15)).toBe(false);
    expect(isMealCategoryAvailable('snack', 10)).toBe(true);
    expect(getAvailableMealCategories(12, ['breakfast','lunch','dinner','snack'])).toEqual(['breakfast','lunch','snack']);
  });
});
