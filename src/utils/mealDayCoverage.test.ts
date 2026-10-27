import {describe,expect,it} from 'vitest';
import {deriveMealDayCoverage} from './mealDayCoverage';

const meal=(id:string,date:string)=>({id,date});

describe('deriveMealDayCoverage',()=>{
  it('counts distinct represented local dates once',()=>{
    expect(deriveMealDayCoverage([
      meal('a','2026-10-02'),meal('b','2026-10-02'),meal('c','2026-09-30'),meal('d','2026-09-28')
    ],'2026-10-02')).toEqual({days:3,windowDays:7,dates:[
      {date:'2026-09-26',logged:false},{date:'2026-09-27',logged:false},
      {date:'2026-09-28',logged:true},{date:'2026-09-29',logged:false},
      {date:'2026-09-30',logged:true},{date:'2026-10-01',logged:false},
      {date:'2026-10-02',logged:true},
    ]});
  });

  it('excludes demo, invalid, future and out-of-window dates',()=>{
    expect(deriveMealDayCoverage([
      meal('moment-1','2026-10-02'),meal('real-a','2026-10-01'),meal('real-b','2026-09-30'),
      meal('old','2026-09-20'),meal('future','2026-10-03'),meal('invalid','2026-02-31')
    ],'2026-10-02')).toEqual({days:2,windowDays:7,dates:[
      {date:'2026-09-26',logged:false},{date:'2026-09-27',logged:false},
      {date:'2026-09-28',logged:false},{date:'2026-09-29',logged:false},
      {date:'2026-09-30',logged:true},{date:'2026-10-01',logged:true},
      {date:'2026-10-02',logged:false},
    ]});
  });

  it('keeps chronological dates accurate across month and leap-day boundaries',()=>{
    const coverage=deriveMealDayCoverage([meal('a','2024-02-29'),meal('b','2024-03-02')],'2024-03-02');
    expect(coverage?.dates.map(day=>day.date)).toEqual(['2024-02-25','2024-02-26','2024-02-27','2024-02-28','2024-02-29','2024-03-01','2024-03-02']);
    expect(coverage?.dates.filter(day=>day.logged).map(day=>day.date)).toEqual(['2024-02-29','2024-03-02']);
  });

  it('stays hidden for sparse history and invalid reference dates',()=>{
    expect(deriveMealDayCoverage([meal('a','2026-10-02')],'2026-10-02')).toBeNull();
    expect(deriveMealDayCoverage([meal('a','2026-10-02'),meal('b','2026-10-01')],'bad-date')).toBeNull();
  });
});
