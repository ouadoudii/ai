import { describe, expect, it } from 'vitest';
import { extractMealItemsDeterministic } from './meal-extractor';

describe('multilingual afternoon meal-slot detection', () => {
  it.each([
    ['بعد الظهر شربت قهوة', 'قهوة'],
    ['العصر كليت ياغورت', 'ياغورت'],
    ['this afternoon I had yogurt', 'ياغورت'],
    ['heute nachmittag hatte ich Joghurt', 'ياغورت'],
    ['cet après-midi j ai mangé un yaourt', 'un ياغورت'],
  ])('assigns %s to the snack slot', (speech, expectedItem) => {
    const result = extractMealItemsDeterministic(speech);

    expect(result.mealDetected).toBe(true);
    expect(result.mealItems).toContain(expectedItem);
    expect(result.mealCategory).toBe('snack');
  });

  it('does not misclassify Arabic بعد الظهر as lunch just because it contains الظهر', () => {
    const result = extractMealItemsDeterministic('بعد الظهر كليت تفاح وشربت ماء');

    expect(result.mealCategory).toBe('snack');
    expect(result.mealItems).toEqual(expect.arrayContaining(['تفاح', 'ماء']));
  });
});
