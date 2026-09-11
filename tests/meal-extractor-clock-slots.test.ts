import { describe, expect, it } from 'vitest';
import { extractMealItemsDeterministic } from '../api/meal-extractor';

describe('meal slot detection from spoken clock times', () => {
  it.each([
    ['Ich habe um 8 Uhr Eier gegessen', 'breakfast'],
    ['I had bread at 13:30', 'lunch'],
    ['J’ai mangé du poisson à 20h', 'dinner'],
    ['كليت خبز الساعة ٨', 'breakfast'],
    ['اكلت رز الساعة ١٤:٣٠', 'lunch'],
    ['تعشيت دجاج الساعة ٢١', 'dinner'],
  ])('assigns %s to %s', (speech, expectedCategory) => {
    const result = extractMealItemsDeterministic(speech);
    expect(result.mealDetected).toBe(true);
    expect(result.mealCategory).toBe(expectedCategory);
  });

  it('keeps an explicit meal name stronger than a conflicting clock time', () => {
    const result = extractMealItemsDeterministic('Frühstück um 13 Uhr mit Brot');
    expect(result.mealCategory).toBe('breakfast');
  });
});
