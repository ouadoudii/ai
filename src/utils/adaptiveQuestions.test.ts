import { describe, expect, it } from 'vitest';
import { selectAdaptiveQuestions } from './adaptiveQuestions';

describe('selectAdaptiveQuestions', () => {
  it('asks only for relevant missing information', () => {
    expect(selectAdaptiveQuestions({ language: 'en', known: [], unusualFatigue: true })).toEqual([
      { key: 'sleep', text: 'How did you sleep last night?' },
    ]);
  });

  it('never asks for information that is already known', () => {
    expect(selectAdaptiveQuestions({ language: 'de', known: ['sleep'], unusualFatigue: true })).toEqual([]);
    expect(selectAdaptiveQuestions({ language: 'fr', known: ['mealTiming'], lateMealPattern: true })).toEqual([]);
  });

  it('asks nothing when there is no current data gap', () => {
    expect(selectAdaptiveQuestions({ language: 'ar', known: [] })).toEqual([]);
  });

  it('limits simultaneous questions and localizes them', () => {
    const questions = selectAdaptiveQuestions({
      language: 'ar',
      known: [],
      unusualFatigue: true,
      lateMealPattern: true,
      lowEnergyPattern: true,
    });
    expect(questions).toHaveLength(2);
    expect(questions.map((question) => question.key)).toEqual(['sleep', 'mealTiming']);
    expect(questions.every((question) => /[\u0600-\u06ff]/.test(question.text))).toBe(true);
  });
});
