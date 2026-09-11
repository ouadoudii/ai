import { describe, expect, it } from 'vitest';
import { extractMealItemsDeterministic } from '../api/meal-extractor';

describe('Arabizi food recognition', () => {
  it.each([
    ['ftour 5obz w 7lib', ['خبز', 'حليب'], 'breakfast'],
    ['lghda 7out w roz', ['سمك', 'أرز'], 'lunch'],
    ['3cha 3dess w 5obz', ['عدس', 'خبز'], 'dinner'],
    ['ftour 7omos w 9ahwa', ['حمص', 'قهوة'], 'breakfast'],
  ])('understands common number-based Arabizi: %s', (speech, expectedItems, expectedCategory) => {
    const result = extractMealItemsDeterministic(speech);
    expect(result.mealDetected).toBe(true);
    expect(result.mealItems).toEqual(expect.arrayContaining(expectedItems));
    expect(result.mealCategory).toBe(expectedCategory);
  });

  it('keeps existing Latin Darija aliases working alongside Arabizi digits', () => {
    const result = extractMealItemsDeterministic('lghda djaj w 7lib w tfa7');
    expect(result.mealItems).toEqual(expect.arrayContaining(['دجاج', 'حليب', 'تفاح']));
    expect(result.mealCategory).toBe('lunch');
  });
});
