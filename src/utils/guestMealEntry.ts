export const GUEST_MEAL_FIRST_KEY = 'rhythm_guest_meal_first_v1';

export function getGuestMealEntry(
  accessMode: 'guest' | 'account',
  optedIn: boolean,
  editorRequested: boolean,
) {
  const mealFirst = accessMode === 'guest' && optedIn;
  return { mealFirst, openFirstMeal: mealFirst && editorRequested };
}
