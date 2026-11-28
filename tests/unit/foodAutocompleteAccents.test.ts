import { describe, expect, it } from 'vitest';
import { mergeAutocompleteSuggestions, normalizeAutocomplete, rankLocalAutocomplete } from '../../src/utils/foodAutocomplete';

describe('accent-insensitive food autocomplete', () => {
  it('folds Latin diacritics without changing the canonical suggestion text', () => {
    expect(normalizeAutocomplete('Crème brûlée')).toBe('creme brulee');
    expect(normalizeAutocomplete('Käsespätzle')).toBe('kasespatzle');
  });

  it('matches French and German foods when users omit keyboard accents', () => {
    expect(rankLocalAutocomplete(['Crème brûlée', 'Croissant'], 'creme bru')).toEqual(['Crème brûlée']);
    expect(rankLocalAutocomplete(['Käsespätzle', 'Bratwurst'], 'kasespatz')).toEqual(['Käsespätzle']);
  });

  it('keeps distinct local suggestions before applying the limit', () => {
    expect(rankLocalAutocomplete(['Crème brûlée', 'Creme brulee', 'Crème caramel'], 'creme', 2))
      .toEqual(['Crème brûlée', 'Crème caramel']);
    expect(rankLocalAutocomplete(['طاجين', ' طاجين ', 'كسكس', ' '], '', 2))
      .toEqual(['طاجين', 'كسكس']);
  });

  it('deduplicates equivalent accented and unaccented AI/local suggestions', () => {
    expect(mergeAutocompleteSuggestions(['Crème brûlée'], ['Creme brulee'], '')).toEqual(['Crème brûlée']);
  });
});
