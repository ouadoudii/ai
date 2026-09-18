import { describe, expect, it } from 'vitest';
import { buildPersonalCoachAnswer } from './personalCoachChat';
import { DailyCheckIn, FoodMoment } from '../types';

const checkIn = (hours:number, energy:number):DailyCheckIn => ({
  id:`c-${hours}-${energy}`, date:'2026-09-18', time:'08:00', timeOfDay:'morning', createdAt:1,
  sleep:{ durationHours: hours }, wellbeing:{ energyLevel:energy }
} as DailyCheckIn);

const meal = { id:'m1', title:'Tajine', date:'2026-09-18', time:'13:00', createdAt:1 } as FoodMoment;

describe('personal coach chat',()=>{
  it('separates personal evidence from general guidance and states uncertainty',()=>{
    const result=buildPersonalCoachAnswer('Warum bin ich müde?',[meal],[checkIn(5.5,2)],'de');
    expect(result.personalObservations).toHaveLength(3);
    expect(result.answer).toContain('Aus deinen Daten');
    expect(result.answer).toContain('Allgemeiner Hinweis');
    expect(result.answer).toContain('Vorläufige Einschätzung');
  });

  it('does not invent a personal explanation when data is missing',()=>{
    const result=buildPersonalCoachAnswer('Why am I tired?',[],[],'en');
    expect(result.personalObservations).toEqual([]);
    expect(result.answer).toContain('not enough personal data');
    expect(result.answer.toLowerCase()).not.toContain('diagnos');
  });

  it.each(['de','en','fr','ar'] as const)('returns localized structured guidance in %s',(language)=>{
    const result=buildPersonalCoachAnswer('today',[meal],[checkIn(6,2)],language);
    expect(result.personalObservations.length).toBeGreaterThan(0);
    expect(result.generalGuidance).toHaveLength(1);
    expect(result.uncertainty.length).toBeGreaterThan(5);
  });
});
