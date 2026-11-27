import { describe, expect, it } from 'vitest';
import { getGuestMealEntry } from '../src/utils/guestMealEntry';

describe('first meal entry', () => {
  it('lets an opted-in new guest open the meal editor without a profile', () => {
    expect(getGuestMealEntry('guest', true, true)).toEqual({ mealFirst: true, openFirstMeal: true });
  });

  it('remembers guest opt-in without reopening the editor on reload', () => {
    expect(getGuestMealEntry('guest', true, false)).toEqual({ mealFirst: true, openFirstMeal: false });
  });

  it('leaves the guided entry intact for guests who did not opt in', () => {
    expect(getGuestMealEntry('guest', false, true)).toEqual({ mealFirst: false, openFirstMeal: false });
  });

  it('does not carry guest onboarding or editor state into an account', () => {
    expect(getGuestMealEntry('account', true, true)).toEqual({ mealFirst: false, openFirstMeal: false });
  });
});
