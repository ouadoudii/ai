import { describe, expect, it } from 'vitest';
import { extractMealItemsDeterministic } from '../api/meal-extractor';

describe('direct multilingual food negations', () => {
  it.each([
    ['breakfast with no eggs but bread', ['خبز'], ['بيض']],
    ['lunch without rice but chicken', ['دجاج'], ['أرز']],
    ['petit déjeuner sans pain avec yaourt', ['ياغورت'], ['خبز']],
    ['déjeuner pas de riz mais poulet', ['دجاج'], ['أرز']],
    ['Frühstück ohne Brot mit Eiern', ['بيض'], ['خبز']],
    ['فطور بدون خبز ومعاه بيض', ['بيض'], ['خبز']],
    ['فطور بلا حليب وخبز', ['خبز'], ['حليب']],
    ['فطور من غير خبز مع ياغورت', ['ياغورت'], ['خبز']],
  ])('excludes only the directly negated food: %s', (speech, included, excluded) => {
    const result = extractMealItemsDeterministic(speech);

    expect(result.mealDetected).toBe(true);
    for (const item of included) expect(result.mealItems).toContain(item);
    for (const item of excluded) expect(result.mealItems).not.toContain(item);
  });

  it('keeps existing German negative determiners working', () => {
    const result = extractMealItemsDeterministic('Frühstück mit keinem Brot aber Eiern');
    expect(result.mealItems).toContain('بيض');
    expect(result.mealItems).not.toContain('خبز');
  });
});
