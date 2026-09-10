import { describe, expect, it } from 'vitest';
import { buildVoiceJournalEntries } from './voiceJournalApply';

const feedback = { title:'ok', message:'ok', type:'praise' as const, badge:'voice' };

describe('explicit voice meal intent recovery', () => {
  it('promotes a wrongly classified Darija snack to breakfast when the transcript explicitly says breakfast', () => {
    const result = buildVoiceJournalEntries({ coachFeedback:feedback, extractedData:{ meals:[{
      category:'snack', timeOfDay:'morning', time:'08:20', mealTitle:'أومليت', mealItems:['أومليت'], hungerBefore:3, fullnessAfter:4,
    }], wellbeingEntries:[] } }, 'فطرت أومليت', 'ar', new Date('2026-09-10T09:00:00'));
    expect(result.moments[0]).toMatchObject({ category:'breakfast', label:'الفطور' });
    expect(result.checkIns[0]).toMatchObject({ timeOfDay:'morning', food:{ category:'breakfast', mealTitle:'أومليت' } });
  });

  it('recovers explicit German lunch intent from a snack misclassification', () => {
    const result = buildVoiceJournalEntries({ coachFeedback:feedback, extractedData:{ meals:[{
      category:'snack', timeOfDay:'midday', time:'13:10', mealTitle:'Linsensuppe', mealItems:['Linsensuppe'], hungerBefore:0, fullnessAfter:0,
    }], wellbeingEntries:[] } }, 'Zum Mittagessen hatte ich Linsensuppe', 'de', new Date('2026-09-10T14:00:00'));
    expect(result.moments[0]).toMatchObject({ category:'lunch', label:'Mittagessen' });
    expect(result.checkIns[0].timeOfDay).toBe('midday');
  });

  it('does not promote a real snack just because it happened in the morning', () => {
    const result = buildVoiceJournalEntries({ coachFeedback:feedback, extractedData:{ meals:[{
      category:'snack', timeOfDay:'morning', time:'10:30', mealTitle:'تفاحة', mealItems:['تفاحة'], hungerBefore:0, fullnessAfter:0,
    }], wellbeingEntries:[] } }, 'كليت تفاحة كسناك', 'ar', new Date('2026-09-10T11:00:00'));
    expect(result.moments[0].category).toBe('snack');
    expect(result.checkIns).toHaveLength(0);
  });
});
