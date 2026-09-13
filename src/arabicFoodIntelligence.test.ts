import { describe, expect, it } from 'vitest';
import { foodSearchMatches, resolveArabFoodAlias } from './utils/arabicFoodIntelligence';
import { rankLocalAutocomplete } from './utils/foodAutocomplete';

describe('composed Arabic food phrases', () => {
  it('resolves a known base food inside a preparation phrase', () => {
    expect(resolveArabFoodAlias('بيض مسلوق', 'MA')?.canonicalEn).toBe('Eggs');
    expect(resolveArabFoodAlias('طاجين دجاج بالزيتون', 'MA')?.canonicalEn).toBe('Moroccan tagine');
    expect(resolveArabFoodAlias('كسكس بالخضر', 'MA')?.canonicalEn).toBe('Couscous');
  });

  it('uses embedded aliases to match local English food names', () => {
    expect(foodSearchMatches('Eggs', 'بيض مسلوق', 'MA')).toBe(true);
    expect(foodSearchMatches('Moroccan tagine', 'طاجين دجاج بالزيتون', 'MA')).toBe(true);
    expect(foodSearchMatches('Couscous', 'كسكس بالخضر', 'MA')).toBe(true);
  });

  it('keeps autocomplete useful offline for composed Arabic dishes', () => {
    const foods = ['Eggs', 'Moroccan tagine', 'Couscous', 'Harira'];
    expect(rankLocalAutocomplete(foods, 'بيض مسلوق')).toEqual(['Eggs']);
    expect(rankLocalAutocomplete(foods, 'طاجين دجاج بالزيتون')).toEqual(['Moroccan tagine']);
  });

  it('does not match aliases inside unrelated words', () => {
    expect(resolveArabFoodAlias('eggplant', 'MA')).toBeNull();
  });
});
