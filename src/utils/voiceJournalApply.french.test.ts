import { describe, expect, it } from 'vitest';
import { buildVoiceJournalEntries } from './voiceJournalApply';
import type { VoiceCheckInResult } from '../apiClient';

const coachFeedback = {
  title: 'Note vocale enregistrée 💚',
  message: 'J’ai compris votre note.',
  type: 'praise' as const,
  badge: 'Check-in vocal',
  habitScore: 88,
};

describe('French voice journal localization', () => {
  it('keeps French labels, metadata and summaries when a French voice note creates journal entries', () => {
    const result: VoiceCheckInResult = {
      coachFeedback,
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

  it.each([
    ['Au petit-déjeuner, j’ai mangé une tartine.', 'morning', 'tartine', 'breakfast', 'Petit-déjeuner'],
    ['Au déjeuner, j’ai mangé du couscous.', 'midday', 'couscous', 'lunch', 'Déjeuner'],
    ['Au dîner, j’ai mangé une soupe.', 'evening', 'soupe', 'dinner', 'Dîner'],
    ['Au diner, j’ai mangé une soupe.', 'evening', 'soupe', 'dinner', 'Dîner'],
  ])('recovers the primary meal from French transcript markers when AI labels it as snack: %s', (transcript, timeOfDay, item, category, label) => {
    const result: VoiceCheckInResult = {
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

    const journal = buildVoiceJournalEntries(result, transcript, 'fr', new Date('2026-09-12T20:00:00'));

    expect(journal.moments[0]).toMatchObject({ category, label });
    expect(journal.checkIns[0]).toMatchObject({ timeOfDay, food: { category, mealTitle: item } });
  });

  it('does not attach a later French snack to an earlier breakfast marker', () => {
    const result: VoiceCheckInResult = {
      coachFeedback,
      extractedData: {
        meals: [{
          category: 'snack',
          timeOfDay: 'morning',
          time: '',
          mealTitle: 'pomme',
          mealItems: ['pomme'],
          hungerBefore: 0,
          fullnessAfter: 0,
        }],
      },
    };

    const journal = buildVoiceJournalEntries(
      result,
      'Au petit-déjeuner, j’ai pris un café. Puis j’ai mangé une pomme.',
      'fr',
      new Date('2026-09-12T11:00:00'),
    );

    expect(journal.moments[0]).toMatchObject({ category: 'snack', label: 'Collation' });
    expect(journal.checkIns).toHaveLength(0);
  });
});
