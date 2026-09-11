import { describe, expect, it } from 'vitest';
import { extractMealItemsDeterministic } from '../api/meal-extractor';

describe('meal slot detection from 12-hour spoken clock times', () => {
  it.each([
    ['I had eggs at 8 am', 'breakfast'],
    ['I had rice at 12 pm', 'lunch'],
    ['I had chicken at 4 pm', 'snack'],
    ['I had fish at 8 pm', 'dinner'],
    ['I had bread at 12 am', 'dinner'],
    ['كليت خبز الساعة ٨ صباح', 'breakfast'],
    ['كليت رز الساعة ١٢ مساء', 'lunch'],
    ['كليت دجاج الساعة ٨ مساء', 'dinner'],
  ])('assigns %s to %s', (speech, expectedCategory) => {
    const result = extractMealItemsDeterministic(speech);
    expect(result.mealDetected).toBe(true);
    expect(result.mealCategory).toBe(expectedCategory);
  });

  it('does not accept impossible 12-hour clock values', () => {
    const result = extractMealItemsDeterministic('I had bread at 13 pm');
    expect(result.mealDetected).toBe(true);
    expect(result.mealCategory).toBe('');
  });
});
