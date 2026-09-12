import { describe, expect, it } from 'vitest';
import { extractMealItemsDeterministic } from '../../api/meal-extractor';

describe('Arabic definite article meal extraction', () => {
  it.each([
    ['تغديت الدجاج والارز والسلطة', ['دجاج', 'أرز', 'سلطة']],
    ['تعشيت السمك والبطاطا', ['سمك', 'بطاطا']],
    ['فطرت البيض والخبز وشربت الحليب', ['بيض', 'خبز', 'حليب']],
  ])('recognizes common Arabic foods with ال and و prefixes: %s', (speech, expectedItems) => {
    const result = extractMealItemsDeterministic(speech);
    expect(result.mealDetected).toBe(true);
    expect(result.mealItems).toEqual(expect.arrayContaining(expectedItems));
  });

  it('keeps preparation matching when the food uses a definite article', () => {
    const result = extractMealItemsDeterministic('تعشيت الدجاج المشوي والسلطة');
    expect(result.mealItems).toContain('دجاج مشوي');
    expect(result.mealItems).toContain('سلطة');
  });
});
