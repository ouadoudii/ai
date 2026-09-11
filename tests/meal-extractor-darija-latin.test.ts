import { describe, expect, it } from 'vitest';
import { extractMealItemsDeterministic } from '../api/meal-extractor';

describe('Darija Latin-script voice fallback', () => {
  it.each([
    ['ftour klit bayd w khobz w shrbt qahwa', 'breakfast', ['بيض', 'خبز', 'قهوة']],
    ['f lghda klit djaj m3a roz w salata', 'lunch', ['دجاج', 'أرز', 'سلطة']],
    ['3cha klit chorba w batata', 'dinner', ['شوربة', 'بطاطا']],
  ])('understands Latin-script Darija transcript: %s', (speech, category, expectedItems) => {
    const result = extractMealItemsDeterministic(speech);
    expect(result.mealDetected).toBe(true);
    expect(result.mealCategory).toBe(category);
    expect(result.mealItems).toEqual(expect.arrayContaining(expectedItems));
  });

  it('keeps mixed Arabic and Latin food words in one capture', () => {
    const result = extractMealItemsDeterministic('فطور bayd وخبز ومن بعد qahwa');
    expect(result.mealCategory).toBe('breakfast');
    expect(result.mealItems).toEqual(expect.arrayContaining(['بيض', 'خبز', 'قهوة']));
  });
});
