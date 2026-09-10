import { describe, expect, it } from 'vitest';
import { buildVoiceJournalEntries } from './voiceJournalApply';

const feedback = { title:'ok', message:'ok', type:'praise' as const, badge:'voice' };

describe('buildVoiceJournalEntries', () => {
  it('creates separate meal moments and assigns primary meals to their matching day check-ins', () => {
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
    expect(morning?.food).toMatchObject({ mealTitle:'بيض وخبز', category:'breakfast', hungerBefore:3, fullnessAfter:4 });
    expect(midday?.wellbeing).toMatchObject({ energyLevel:4, mood:'energized', stressLevel:2, waterGlasses:3 });
    expect(midday?.food).toMatchObject({ mealTitle:'كسكس بالخضرة', category:'lunch', hungerBefore:4 });
  });

  it('deduplicates identical meals returned twice by semantic extraction', () => {
    const duplicate = { category:'breakfast', timeOfDay:'morning', time:'08:15', mealTitle:'أومليت بالجبن', mealItems:['أومليت بالجبن'], hungerBefore:3, fullnessAfter:4 };
    const result = buildVoiceJournalEntries({
      coachFeedback: feedback,
      extractedData: { meals:[duplicate,{...duplicate}], wellbeingEntries:[] },
    }, 'فطرت أومليت بالجبن', 'ar', new Date('2026-09-10T09:00:00'));

    expect(result.moments).toHaveLength(1);
    expect(result.moments[0]).toMatchObject({title:'أومليت بالجبن',category:'breakfast',time:'08:15'});
    expect(result.checkIns).toHaveLength(1);
    expect(result.checkIns[0].food).toMatchObject({mealTitle:'أومليت بالجبن',category:'breakfast'});
  });

  it('keeps repeated dishes when they are genuinely separate meals at different times', () => {
    const result = buildVoiceJournalEntries({
      coachFeedback: feedback,
      extractedData: { meals:[
        { category:'snack', timeOfDay:'morning', time:'10:00', mealTitle:'قهوة', mealItems:['قهوة'], hungerBefore:0, fullnessAfter:0 },
        { category:'snack', timeOfDay:'midday', time:'16:00', mealTitle:'قهوة', mealItems:['قهوة'], hungerBefore:0, fullnessAfter:0 },
      ], wellbeingEntries:[] },
    }, 'شربت قهوة الصباح وقهوة فالعشية', 'ar', new Date('2026-09-10T17:00:00'));

    expect(result.moments).toHaveLength(2);
    expect(result.moments.map(m=>m.time)).toEqual(['10:00','16:00']);
  });

  it('derives the day slot from breakfast/lunch/dinner even when the model leaves timeOfDay empty', () => {
    const result = buildVoiceJournalEntries({
      coachFeedback: feedback,
      extractedData: {
        meals: [
          { category:'breakfast', timeOfDay:'', time:'', mealTitle:'مسمن بالعسل', mealItems:['مسمن بالعسل'], hungerBefore:0, fullnessAfter:0 },
          { category:'lunch', timeOfDay:'', time:'', mealTitle:'العدس بالقلياء', mealItems:['العدس بالقلياء'], hungerBefore:0, fullnessAfter:0 },
          { category:'dinner', timeOfDay:'', time:'', mealTitle:'حريرة', mealItems:['حريرة'], hungerBefore:0, fullnessAfter:0 },
        ],
        wellbeingEntries: [],
      },
    }, 'الفطور مسمن، الغدا العدس، العشا حريرة', 'ar', new Date('2026-09-10T16:00:00'));

    expect(result.checkIns.map(c => c.timeOfDay).sort()).toEqual(['evening','midday','morning']);
    expect(result.checkIns.find(c => c.timeOfDay==='morning')?.food?.category).toBe('breakfast');
    expect(result.checkIns.find(c => c.timeOfDay==='midday')?.food?.category).toBe('lunch');
    expect(result.checkIns.find(c => c.timeOfDay==='evening')?.food?.category).toBe('dinner');
  });

  it('keeps snacks as moments without falsely completing a main meal slot', () => {
    const result = buildVoiceJournalEntries({
      coachFeedback: feedback,
      extractedData: { meals:[{category:'snack',timeOfDay:'midday',time:'',mealTitle:'تفاحة',mealItems:['تفاحة'],hungerBefore:0,fullnessAfter:0}], wellbeingEntries:[] },
    }, 'كليت تفاحة كسناك', 'ar', new Date('2026-09-10T14:00:00'));
    expect(result.moments).toHaveLength(1);
    expect(result.moments[0].category).toBe('snack');
    expect(result.checkIns).toHaveLength(0);
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

  it('keeps backwards compatibility with a legacy single meal payload and assigns it to the right slot', () => {
    const result = buildVoiceJournalEntries({ coachFeedback: feedback, extractedData:{ mealTitle:'حريرة', mealItems:['حريرة'], mealCategory:'dinner' } }, 'تعشيت حريرة', 'ar', new Date('2026-09-10T20:00:00'));
    expect(result.moments).toHaveLength(1);
    expect(result.moments[0]).toMatchObject({ category:'dinner', title:'حريرة' });
    expect(result.checkIns.find(c=>c.timeOfDay==='evening')?.food).toMatchObject({ mealTitle:'حريرة', category:'dinner' });
  });
});
