import { describe, expect, it } from 'vitest';
import { buildVoiceJournalEntries } from './voiceJournalApply';

const feedback = { title:'ok', message:'ok', type:'praise' as const, badge:'voice' };

describe('Arabic voice meal dedupe', () => {
  it('deduplicates the same Arabic meal across diacritics, tatweel and alef variants', () => {
    const result = buildVoiceJournalEntries({
      coachFeedback: feedback,
      extractedData: {
        meals: [
          { category:'breakfast', timeOfDay:'morning', time:'08:15', mealTitle:'أُومليت بالجبنة', mealItems:['أُومليت بالجبنة'], hungerBefore:3, fullnessAfter:4 },
          { category:'breakfast', timeOfDay:'morning', time:'08:15', mealTitle:'اومليت بالجبنه', mealItems:['اومليت بالجبنه'], hungerBefore:3, fullnessAfter:4 },
          { category:'breakfast', timeOfDay:'morning', time:'08:15', mealTitle:'اومليت بـالجبـنة', mealItems:['اومليت بـالجبـنة'], hungerBefore:3, fullnessAfter:4 },
        ],
        wellbeingEntries: [],
      },
    }, 'فطرت أُومليت بالجبنة', 'ar', new Date('2026-09-13T09:00:00'));

    expect(result.moments).toHaveLength(1);
    expect(result.moments[0]).toMatchObject({ category:'breakfast', time:'08:15' });
    expect(result.checkIns).toHaveLength(1);
    expect(result.checkIns[0].food?.mealTitle).toBe('أُومليت بالجبنة');
  });

  it('still keeps truly separate repeated meals at different times', () => {
    const result = buildVoiceJournalEntries({
      coachFeedback: feedback,
      extractedData: {
        meals: [
          { category:'coffee', timeOfDay:'morning', time:'09:00', mealTitle:'قَهْوَة', mealItems:['قَهْوَة'], hungerBefore:0, fullnessAfter:0 },
          { category:'coffee', timeOfDay:'midday', time:'16:00', mealTitle:'قهوة', mealItems:['قهوة'], hungerBefore:0, fullnessAfter:0 },
        ],
        wellbeingEntries: [],
      },
    }, 'شربت قهوة الصباح وقهوة فالعشية', 'ar', new Date('2026-09-13T17:00:00'));

    expect(result.moments).toHaveLength(2);
    expect(result.moments.map(m => m.time)).toEqual(['09:00','16:00']);
  });
});
