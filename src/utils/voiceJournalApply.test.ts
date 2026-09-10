import { describe, expect, it } from 'vitest';
import { buildVoiceJournalEntries } from './voiceJournalApply';

const feedback = { title:'ok', message:'ok', type:'praise' as const, badge:'voice' };

describe('buildVoiceJournalEntries', () => {
  it('creates separate meal moments and separate wellbeing observations from one free voice note', () => {
    const result = buildVoiceJournalEntries({
      coachFeedback: feedback,
      extractedData: {
        meals: [
          { category:'breakfast', timeOfDay:'morning', time:'08:30', mealTitle:'بيض وخبز', mealItems:['جوج بيضات مسلوقين','خبز'], hungerBefore:3, fullnessAfter:4 },
          { category:'snack', timeOfDay:'morning', time:'', mealTitle:'كرواسون', mealItems:['كرواسون'], hungerBefore:0, fullnessAfter:0 },
          { category:'lunch', timeOfDay:'midday', time:'13:20', mealTitle:'كسكس بالخضرة', mealItems:['كسكس بالخضرة'], hungerBefore:4, fullnessAfter:0 },
        ],
        sleepHours: 7.5,
        sleepQuality: 4,
        wakeFeeling: 'tired',
        wellbeingEntries: [
          { timeOfDay:'morning', energyLevel:2, mood:'', stressLevel:0, waterGlasses:0, note:'فقت عيان شوية' },
          { timeOfDay:'midday', energyLevel:4, mood:'energized', stressLevel:2, waterGlasses:3, note:'من بعد الغدا حسيت مزيان' },
        ],
      },
    }, 'free transcript', 'ar', new Date('2026-09-10T14:00:00'));

    expect(result.moments).toHaveLength(3);
    expect(result.moments.map(m => m.category)).toEqual(['breakfast','snack','lunch']);
    expect(result.moments[0]).toMatchObject({ title:'بيض وخبز', time:'08:30', hungerLevel:3, fullnessLevel:4 });
    expect(result.checkIns).toHaveLength(2);
    const morning = result.checkIns.find(c => c.timeOfDay === 'morning');
    const midday = result.checkIns.find(c => c.timeOfDay === 'midday');
    expect(morning?.sleep).toMatchObject({ durationHours:7.5, quality:4, wakeFeeling:'tired' });
    expect(morning?.wellbeing).toMatchObject({ energyLevel:2, voiceTranscription:'free transcript' });
    expect(midday?.wellbeing).toMatchObject({ energyLevel:4, mood:'energized', stressLevel:2, waterGlasses:3 });
  });

  it('does not fabricate unmentioned wellbeing values', () => {
    const result = buildVoiceJournalEntries({
      coachFeedback: feedback,
      extractedData: { meals:[], sleepHours:0, wellbeingEntries:[{timeOfDay:'evening',energyLevel:2,mood:'',stressLevel:0,waterGlasses:0,note:''}] },
    }, 'كنت عيان فالعشية', 'ar', new Date('2026-09-10T20:00:00'));
    expect(result.checkIns[0].wellbeing).toEqual({ energyLevel:2, voiceTranscription:'كنت عيان فالعشية' });
    expect(result.checkIns[0].wellbeing).not.toHaveProperty('stressLevel');
    expect(result.checkIns[0].wellbeing).not.toHaveProperty('mood');
  });

  it('keeps backwards compatibility with a legacy single meal payload', () => {
    const result = buildVoiceJournalEntries({ coachFeedback: feedback, extractedData:{ mealTitle:'حريرة', mealItems:['حريرة'], mealCategory:'dinner' } }, 'تعشيت حريرة', 'ar', new Date('2026-09-10T20:00:00'));
    expect(result.moments).toHaveLength(1);
    expect(result.moments[0]).toMatchObject({ category:'dinner', title:'حريرة' });
  });
});
