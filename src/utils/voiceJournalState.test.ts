import { describe, expect, it } from 'vitest';
import { DailyCheckIn, FoodMoment } from '../types';
import { mergeVoiceCheckIns, mergeVoiceMoments, mergeVoiceText } from './voiceJournalState';

const moment = (id:string,title:string,time:string,notes=''):FoodMoment => ({
  id,title,label:'Meal',category:'lunch',date:'2026-09-18',time,location:'Home',locationCategory:'home',
  imageUrl:'',rating:5,mood:'satisfied',tags:['voice'],notes,createdAt:Number(id.replace(/\D/g,''))||1,
});
const check = (id:string,phase:'morning'|'midday'|'evening',transcript:string,mealTitle?:string):DailyCheckIn => ({
  id,date:'2026-09-18',time:phase==='morning'?'08:00':phase==='midday'?'13:00':'20:00',timeOfDay:phase,
  food:mealTitle?{mealTitle,category:phase==='morning'?'breakfast':phase==='midday'?'lunch':'dinner'}:undefined,
  wellbeing:{voiceTranscription:transcript},createdAt:1,
});

describe('durable voice journal state',()=>{
  it('keeps earlier spoken detail when the same phase is updated later',()=>{
    const result=mergeVoiceCheckIns(
      [check('old','midday','فالغدا كليت كسكس بالخضرة','كسكس بالخضرة')],
      [check('new','midday','ومن بعد الغدا شربت أتاي','أتاي')],
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('old');
    expect(result[0].wellbeing.voiceTranscription).toContain('فالغدا كليت كسكس بالخضرة');
    expect(result[0].wellbeing.voiceTranscription).toContain('ومن بعد الغدا شربت أتاي');
    expect(result[0].food?.mealTitle).toBe('كسكس بالخضرة · أتاي');
  });

  it.each([
    ['German','Couscous','Salat','Nein, mittags hatte ich nicht Couscous, sondern Salat.'],
    ['English','Couscous','Salad','No, I had not Couscous but Salad for lunch.'],
    ['French','Couscous','Salade','Non, pas Couscous mais Salade à midi.'],
    ['Darija','كسكس','سلطة','لا، ماشي كسكس ولكن سلطة فالغدا.'],
    ['Arabic','كسكس','سلطة','ليس كسكس بل سلطة في الغداء.'],
  ])('replaces a rejected meal for an explicit %s voice correction',(_language,oldMeal,newMeal,transcript)=>{
    const result=mergeVoiceCheckIns(
      [check('old','midday',`Previously: ${oldMeal}`,oldMeal)],
      [check('new','midday',transcript,newMeal)],
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('old');
    expect(result[0].food?.mealTitle).toBe(newMeal);
    expect(result[0].wellbeing.voiceTranscription).toContain(transcript);
  });

  it('keeps genuinely additive meal input additive',()=>{
    const result=mergeVoiceCheckIns(
      [check('old','midday','I had couscous','Couscous')],
      [check('new','midday','I also had yogurt','Yogurt')],
    );
    expect(result[0].food?.mealTitle).toBe('Couscous · Yogurt');
  });

  it('does not silently replace an ambiguous contradictory meal',()=>{
    const result=mergeVoiceCheckIns(
      [check('old','midday','I had couscous','Couscous')],
      [check('new','midday','Salad','Salad')],
    );
    expect(result[0].food?.mealTitle).toBe('Couscous · Salad');
  });

  it('does not duplicate the same meal when a whole-day recap has no exact clock time',()=>{
    const existing=moment('m1','كسكس بالخضرة','13:15','الغدا كان كسكس بالخضرة');
    const recap=moment('m2','كسكس بالخضرة','','عاودت فملخص النهار أن الغدا كان كسكس بالخضرة');
    const result=mergeVoiceMoments([existing],[recap]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('m1');
    expect(result[0].time).toBe('13:15');
    expect(result[0].notes).toContain('الغدا كان كسكس بالخضرة');
    expect(result[0].notes).toContain('عاودت فملخص النهار');
  });

  it('keeps genuinely separate repeated meals when both times differ',()=>{
    const result=mergeVoiceMoments([moment('m1','قهوة','10:00')],[moment('m2','قهوة','16:00')]);
    expect(result).toHaveLength(2);
    expect(result.map(item=>item.time).sort()).toEqual(['10:00','16:00']);
  });

  it('does not repeat identical transcript text',()=>{
    expect(mergeVoiceText('I ate eggs','I ate eggs')).toBe('I ate eggs');
    expect(mergeVoiceText('I ate eggs','I ate eggs and bread')).toBe('I ate eggs and bread');
  });
});