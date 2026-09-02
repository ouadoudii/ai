import { describe, expect, it } from 'vitest';
import { getFoodSuggestions } from './utils/foodSuggestions';

describe('country-aware food suggestions', () => {
  it('puts Moroccan lunch options before global options for MA', () => {
    const suggestions = getFoodSuggestions('MA', 'lunch');
    expect(suggestions.length).toBeGreaterThan(20);
    expect(suggestions[0].name).toBe('Chicken tagine with preserved lemon');
    expect(suggestions.some((item) => item.name === 'Couscous with seven vegetables')).toBe(true);
  });

  it('filters the expanded catalogue by free-text query', () => {
    const suggestions = getFoodSuggestions('MA', 'lunch', 'tagine');
    expect(suggestions.length).toBeGreaterThanOrEqual(3);
    expect(suggestions.every((item) => item.name.toLowerCase().includes('tagine'))).toBe(true);
  });

  it('falls back to global suggestions for an unknown country', () => {
    const suggestions = getFoodSuggestions('ZZ', 'breakfast');
    expect(suggestions[0].name).toBe('Avocado toast');
    expect(suggestions.length).toBeGreaterThan(5);
  });
});
