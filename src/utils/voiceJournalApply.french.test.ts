import { describe, expect, it } from 'vitest';
import { buildVoiceJournalEntries } from './voiceJournalApply';
import type { VoiceCheckInResult } from '../apiClient';

describe('French voice journal localization', () => {
  it('keeps French labels, metadata and summaries when a French voice note creates journal entries', () => {
    const result: VoiceCheckInResult = {
      coachFeedback: {
        title: 'Note vocale enregistrée 💚',
        message: 'J’ai compris votre note.',
        type: 'praise',
        badge: 'Check-in vocal',
        habitScore: 88,
      },
      extractedData: {
        meals: [{
          category: 'breakfast',
          timeOfDay: 'morning',
          time: '08:15',
          mealTitle: 'Café et tartine',
          mealItems: ['café', 'tartine'],
          hungerBefore: 3,
          fullnessAfter: 4,
        }],
      },
    };

    const journal = buildVoiceJournalEntries(
      result,
      'Au petit-déjeuner, j’ai pris un café et une tartine.',
      'fr',
      new Date('2026-09-12T09:00:00'),
    );

    expect(journal.moments).toHaveLength(1);
    expect(journal.moments[0]).toMatchObject({
      label: 'Petit-déjeuner',
      location: 'Non précisé',
      notes: 'Ajouté depuis une note vocale',
    });
    expect(journal.checkIns).toHaveLength(1);
    expect(journal.checkIns[0].coachSummary).toBe('Extrait automatiquement de votre note vocale.');
  });
});
