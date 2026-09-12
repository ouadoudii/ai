import { describe, expect, it } from 'vitest';
import { buildVoiceJournalEntries } from './voiceJournalApply';
import type { VoiceCheckInResult, VoiceLanguage } from '../apiClient';

const coachFeedback = {
  title: 'Voice note',
  message: 'Captured',
  type: 'praise' as const,
  badge: 'Voice',
  habitScore: 88,
};

function snackResult(timeOfDay: 'morning'|'midday'|'evening', item: string): VoiceCheckInResult {
  return {
    coachFeedback,
    extractedData: {
      meals: [{
        category: 'snack',
        timeOfDay,
        time: '',
        mealTitle: item,
        mealItems: [item],
        hungerBefore: 0,
        fullnessAfter: 0,
      }],
    },
  };
}

describe('accent-insensitive voice meal markers', () => {
  it.each([
    ['Au petit dejeuner, j’ai pris une tartine.', 'fr', 'morning', 'tartine', 'breakfast'],
    ['Au dejeuner, j’ai mangé du couscous.', 'fr', 'midday', 'couscous', 'lunch'],
    ['Zum Fruhstuck hatte ich Brot.', 'de', 'morning', 'Brot', 'breakfast'],
  ] as const)('recovers %s when speech-to-text drops diacritics', (transcript, language, phase, item, category) => {
    const journal = buildVoiceJournalEntries(
      snackResult(phase, item),
      transcript,
      language as VoiceLanguage,
      new Date('2026-09-12T12:00:00'),
    );

    expect(journal.moments[0].category).toBe(category);
    expect(journal.checkIns).toHaveLength(1);
    expect(journal.checkIns[0].food?.category).toBe(category);
  });

  it('still accepts correctly accented French and German markers', () => {
    const french = buildVoiceJournalEntries(snackResult('midday', 'couscous'), 'Au déjeuner, couscous.', 'fr');
    const german = buildVoiceJournalEntries(snackResult('morning', 'Brot'), 'Zum Frühstück Brot.', 'de');

    expect(french.moments[0].category).toBe('lunch');
    expect(german.moments[0].category).toBe('breakfast');
  });
});
