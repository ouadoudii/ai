import { describe, expect, it } from 'vitest';
import { buildTodayPriorities } from './utils/todayPriorities';

const lunch=(id:string,time:string)=>({id,title:'Lunch',category:'lunch',time,date:'2026-09-18',createdAt:Date.now()}) as any;
const sleep=(id:string,date:string,energy:number)=>({id,date,timeOfDay:'morning',createdAt:Date.now(),sleep:{durationHours:6},wellbeing:{energyLevel:energy}}) as any;
const energy=(id:string,date:string,level:number)=>({id,date,timeOfDay:'midday',createdAt:Date.now(),wellbeing:{energyLevel:level}}) as any;

describe('buildTodayPriorities',()=>{
  it('prioritizes a real repeated lunch rhythm and exposes evidence without overstating certainty',()=>{
    const priorities=buildTodayPriorities([lunch('user-1','14:20'),lunch('user-2','14:35'),lunch('user-3','13:10')],[],'de');
    expect(priorities).toHaveLength(1);
    expect(priorities[0].id).toBe('lunch-rhythm');
    expect(priorities[0].body).toContain('Mittagessen');
    expect(priorities[0].evidence).toContain('3 echten Einträgen');
    expect(priorities[0].confidence).toBe('Signal');
  });

  it('shows at most two priorities and localizes evidence in Arabic',()=>{
    const checks=[sleep('sleep-a','2026-09-16',2),energy('energy-a','2026-09-16',2),sleep('sleep-b','2026-09-17',2),energy('energy-b','2026-09-17',1)];
    const moments=[lunch('user-1','14:20'),lunch('user-2','14:35'),lunch('user-3','14:10')];
    const priorities=buildTodayPriorities(moments,checks,'ar');
    expect(priorities).toHaveLength(2);
    expect(priorities[0].evidence).toContain('إدخالات حقيقية');
    expect(priorities.every(p=>p.id!=='learning')).toBe(true);
  });

  it('does not invent a personalized priority without sufficient real evidence',()=>{
    expect(buildTodayPriorities([],[],'en')).toEqual([]);
    expect(buildTodayPriorities([lunch('moment-1','15:00')],[],'fr')).toEqual([]);
  });
});
