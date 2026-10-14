import {describe,expect,it} from 'vitest';
import {deriveMealFrequencyInsight} from '../src/utils/mealFrequencyInsight';

const meal=(id:string,title:string,date:string,time='08:00')=>({id,title,date,time});

describe('deriveMealFrequencyInsight',()=>{
  it('returns a repeated real meal inside the inclusive 7-day window',()=>{
    const result=deriveMealFrequencyInsight([
      meal('u1','بيض مسلوق','2026-09-26'),
      meal('u2','بيض مسلوق','2026-09-29'),
      meal('u3','بيض مسلوق','2026-10-02'),
    ],'2026-10-02');
    expect(result).toEqual({title:'بيض مسلوق',count:3});
  });

  it('ignores demo, blank, future and older-than-window entries',()=>{
    const result=deriveMealFrequencyInsight([
      meal('moment-3','Couscous','2026-10-02'),
      meal('u1','Couscous','2026-09-25'),
      meal('u2','   ','2026-10-01'),
      meal('u3','Couscous','2026-10-03'),
      meal('u4','Couscous','2026-09-28'),
      meal('u5','Couscous','2026-09-29'),
    ],'2026-10-02');
    expect(result).toBeNull();
  });

  it('normalizes accents and Arabic harakat while preserving latest exact wording',()=>{
    const result=deriveMealFrequencyInsight([
      meal('u1','بَيْض مسلوق','2026-09-28'),
      meal('u2','بيض مسلوق','2026-09-30'),
      meal('u3','بيض مسلوق','2026-10-02'),
    ],'2026-10-02');
    expect(result).toEqual({title:'بيض مسلوق',count:3});
  });

  it('breaks equal-count ties by the most recently logged meal',()=>{
    const result=deriveMealFrequencyInsight([
      meal('a1','Pain complet','2026-09-27'),meal('a2','Pain complet','2026-09-28'),meal('a3','Pain complet','2026-10-01','07:00'),
      meal('b1','زبادي','2026-09-27'),meal('b2','زبادي','2026-09-29'),meal('b3','زبادي','2026-10-01','09:00'),
    ],'2026-10-02');
    expect(result).toEqual({title:'زبادي',count:3});
  });
});
