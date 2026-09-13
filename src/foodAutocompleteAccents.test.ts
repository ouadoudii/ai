import { describe, expect, it } from 'vitest';
import { mergeAutocompleteSuggestions, normalizeAutocomplete, rankLocalAutocomplete } from './utils/foodAutocomplete';

describe('accent-insensitive food autocomplete', () => {
  it('folds Latin diacritics without changing the canonical suggestion text', () => {
    expect(normalizeAutocomplete('Crème brûlée')).toBe('creme brulee');
    expect(normalizeAutocomplete('Käsespätzle')).toBe('kasespatzle');
  });

  it('matches French and German foods when users omit keyboard accents', () => {
    expect(rankLocalAutocomplete(['Crème brûlée', 'Croissant'], 'creme bru')).toEqual(['Crème brûlée']);
    expect(rankLocalAutocomplete(['Käsespätzle', 'Bratwurst'], 'kasespatz')).toEqual(['Käsespätzle']);
  });

  it('deduplicates equivalent accented and unaccented AI/local suggestions', () => {
    expect(mergeAutocompleteSuggestions(['Crème brûlée'], ['Creme brulee'], '')).toEqual(['Crème brûlée']);
  });
});
