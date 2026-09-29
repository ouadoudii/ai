import { describe,expect,it } from 'vitest';
import { getLatestRepeatMeal } from '../src/utils/latestRepeatMeal';
import type { FoodMoment } from '../src/types';

const meal=(id:string,createdAt:number,title=id):FoodMoment=>({id,title,category:'breakfast',date:'2026-09-28',time:'08:00',location:'',locationCategory:'home',imageUrl:'',rating:5,mood:'satisfied',tags:[],createdAt});

describe('getLatestRepeatMeal',()=>{
  it('returns the newest real meal regardless of input order',()=>{
    expect(getLatestRepeatMeal([meal('user-old',10),meal('user-new',30),meal('user-mid',20)])?.id).toBe('user-new');
  });

  it('never offers seeded demo moments',()=>{
    expect(getLatestRepeatMeal([meal('moment-1',99),meal('user-real',20)])?.id).toBe('user-real');
    expect(getLatestRepeatMeal([meal('moment-1',99),meal('moment-12',100)])).toBeUndefined();
  });

  it('does not mutate the persisted input order',()=>{
    const moments=[meal('older',1),meal('newer',2)];
    getLatestRepeatMeal(moments);
    expect(moments.map(moment=>moment.id)).toEqual(['older','newer']);
  });
});
