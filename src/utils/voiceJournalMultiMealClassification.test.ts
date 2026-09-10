import { describe, expect, it } from 'vitest';
import { buildVoiceJournalEntries } from './voiceJournalApply';

const feedback = { title:'ok', message:'ok', type:'praise' as const, badge:'voice' };

describe('multi-meal voice slot repair', () => {
  it('repairs a snack misclassification when its phase matches an explicit meal statement', () => {
    const result = buildVoiceJournalEntries({
      coachFeedback: feedback,
      extractedData: { meals:[
        { category:'snack', timeOfDay:'morning', time:'08:00', mealTitle:'أومليت', mealItems:['أومليت'], hungerBefore:3, fullnessAfter:4 },
        { category:'lunch', timeOfDay:'midday', time:'13:30', mealTitle:'كسكس', mealItems:['كسكس'], hungerBefore:4, fullnessAfter:5 },
      ], wellbeingEntries:[] },
    }, 'فطرت أومليت وفالغدا كليت كسكس', 'ar', new Date('2026-09-10T14:00:00'));

    expect(result.moments.map(m=>m.category)).toEqual(['breakfast','lunch']);
    expect(result.checkIns.find(c=>c.timeOfDay==='morning')?.food).toMatchObject({mealTitle:'أومليت',category:'breakfast'});
    expect(result.checkIns.find(c=>c.timeOfDay==='midday')?.food).toMatchObject({mealTitle:'كسكس',category:'lunch'});
  });

  it('keeps a genuine snack when its phase has no matching explicit primary-meal statement', () => {
    const result = buildVoiceJournalEntries({
      coachFeedback: feedback,
      extractedData: { meals:[
        { category:'breakfast', timeOfDay:'morning', time:'08:00', mealTitle:'بيض', mealItems:['بيض'], hungerBefore:0, fullnessAfter:0 },
        { category:'snack', timeOfDay:'midday', time:'16:00', mealTitle:'تفاحة', mealItems:['تفاحة'], hungerBefore:0, fullnessAfter:0 },
      ], wellbeingEntries:[] },
    }, 'فطرت بيض ومن بعد كليت تفاحة كسناك', 'ar', new Date('2026-09-10T17:00:00'));

    expect(result.moments.map(m=>m.category)).toEqual(['breakfast','snack']);
    expect(result.checkIns.map(c=>c.timeOfDay)).toEqual(['morning']);
  });
});
