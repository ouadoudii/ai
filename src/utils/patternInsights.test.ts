import { describe, expect, it } from 'vitest';
import { buildPatternInsights, confidenceForEvidence } from './patternInsights';
import type { DailyCheckIn, FoodMoment } from '../types';

const check=(id:string,date:string,timeOfDay:DailyCheckIn['timeOfDay'],energy:number,sleep?:number):DailyCheckIn=>({id,date,time:'14:00',timeOfDay,sleep:sleep===undefined?undefined:{durationHours:sleep},wellbeing:{energyLevel:energy},createdAt:Date.parse(`${date}T14:00:00Z`)});
const meal=(id:string,date:string,time:string,category:FoodMoment['category'],extra:Partial<FoodMoment>={}):FoodMoment=>({id,title:'Meal',label:'Meal',category,date,time,location:'Home',locationCategory:'home',imageUrl:'',rating:4,mood:'satisfied',tags:[],createdAt:Date.parse(`${date}T${time}:00Z`),...extra});

describe('pattern insights',()=>{
  it('uses transparent evidence thresholds',()=>{expect(confidenceForEvidence(2)).toBe('Signal');expect(confidenceForEvidence(4)).toBe('Trend');expect(confidenceForEvidence(7)).toBe('Pattern');});

  it('finds a repeated short-sleep / later-low-energy association and explicitly rejects causal inference',()=>{
    const checks=[check('u1','2026-09-10','morning',3,6),check('u2','2026-09-10','midday',2),check('u3','2026-09-11','morning',3,6.5),check('u4','2026-09-11','midday',1)];
    const insight=buildPatternInsights([],checks).find(i=>i.id==='sleep-energy');
    expect(insight?.evidenceCount).toBe(2);
    expect(insight?.observation).toContain('2 of 2');
    expect(insight?.observation).toContain('not proof that one caused the other');
    expect(insight?.observation.toLowerCase()).not.toMatch(/\bbecause\b|\btherefore\b/);
  });

  it('connects late lunch with evening snacking only after several comparable lunch days',()=>{
    const moments=[meal('u1','2026-09-10','14:30','lunch'),meal('u2','2026-09-10','20:00','snack'),meal('u3','2026-09-11','14:10','lunch'),meal('u4','2026-09-11','21:00','snack'),meal('u5','2026-09-12','14:20','lunch'),meal('u6','2026-09-12','20:30','snack')];
    const insight=buildPatternInsights(moments,[]).find(i=>i.id==='late-lunch-snacking');
    expect(insight?.evidenceCount).toBe(3);expect(insight?.observation).toContain('3 of 3');
  });

  it('does not claim a cross-domain pattern from a single observation',()=>{
    const moments=[meal('u1','2026-09-10','14:30','lunch'),meal('u2','2026-09-10','20:00','snack')];
    expect(buildPatternInsights(moments,[]).some(i=>i.id==='late-lunch-snacking')).toBe(false);
  });
});
