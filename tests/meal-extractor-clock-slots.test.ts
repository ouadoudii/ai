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

  it.each([
    ['Frühstück um 13 Uhr mit Brot', 'breakfast'],
    ['Mittagessen um 9 Uhr mit Reis', 'lunch'],
    ['Abendessen um 12 Uhr mit Fisch', 'dinner'],
  ])('keeps explicit German meal names stronger than a conflicting clock time: %s', (speech, expectedCategory) => {
    const result = extractMealItemsDeterministic(speech);
    expect(result.mealCategory).toBe(expectedCategory);
  });
});
