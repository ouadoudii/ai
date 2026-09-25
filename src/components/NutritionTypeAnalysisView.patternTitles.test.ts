import { describe, expect, it } from 'vitest';
import { patternTitles } from './NutritionTypeAnalysisView';

const insightIds = ['sleep-energy', 'pace-energy', 'lunch-rhythm', 'late-lunch-snacking', 'distraction-fullness', 'learning'];

describe('NutritionTypeAnalysisView pattern titles', () => {
  it('has an explicit localized title for every generated insight in every supported language', () => {
    for (const language of ['de', 'en', 'fr', 'ar'] as const) {
      for (const id of insightIds) {
        expect(patternTitles[language][id], `${language}:${id}`).toBeTruthy();
      }
    }
  });

  it('does not fall back to the English late-lunch title in non-English locales', () => {
    const english = patternTitles.en['late-lunch-snacking'];
    expect(patternTitles.de['late-lunch-snacking']).not.toBe(english);
    expect(patternTitles.fr['late-lunch-snacking']).not.toBe(english);
    expect(patternTitles.ar['late-lunch-snacking']).not.toBe(english);
  });
});
