import { describe, expect, it } from 'vitest';
import { extractMealItemsDeterministic } from '../../api/meal-extractor';

describe('German free-form meal negation', () => {
  it.each([
    ['morgens habe ich keine Eier gegessen, aber Brot', 'بيض', 'خبز'],
    ['mittags hatte ich keinen Reis, aber Salat', 'أرز', 'سلطة'],
    ['abends habe ich kein Fleisch gegessen, aber Kartoffeln', 'لحم', 'بطاطا'],
    ['ich hatte keine Suppe, aber Tee', 'شوربة', 'شاي'],
  ])('does not record locally negated food: %s', (speech, negatedItem, keptItem) => {
    const result = extractMealItemsDeterministic(speech);
    expect(result.mealDetected).toBe(true);
    expect(result.mealItems).not.toContain(negatedItem);
    expect(result.mealItems).toContain(keptItem);
  });

  it('does not turn a negative-only German statement into a meal', () => {
    const result = extractMealItemsDeterministic('heute morgen habe ich keine Eier gegessen');
    expect(result.mealDetected).toBe(false);
    expect(result.mealItems).toEqual([]);
    expect(result.mealCategory).toBe('breakfast');
  });
});
