import {describe,expect,it} from 'vitest';
import type {FoodMoment} from '../src/types';
import {canRepeatFromDetail,getRepeatFromDetailCopy} from '../src/utils/repeatFromDetail';

const meal=(id:string,title='بيض مسلوق / œufs'):FoodMoment=>({id,title,category:'breakfast',date:'2026-10-02',time:'08:00',location:'',rating:5,mood:'satisfied',tags:[],createdAt:Date.now()} as FoodMoment);

describe('repeat from Moment Detail',()=>{
  it('allows a real saved multilingual meal',()=>expect(canRepeatFromDetail(meal('user-42'))).toBe(true));
  it('rejects seeded demo moments',()=>expect(canRepeatFromDetail(meal('moment-3'))).toBe(false));
  it('rejects missing meal identity',()=>expect(canRepeatFromDetail(meal('user-42','   '))).toBe(false));
  it('provides localized DE/EN/FR/AR action copy',()=>{
    expect(getRepeatFromDetailCopy('en').label).toBe('Again');
    expect(getRepeatFromDetailCopy('de').label).toBe('Nochmal');
    expect(getRepeatFromDetailCopy('fr').label).toBe('À nouveau');
    expect(getRepeatFromDetailCopy('ar').label).toBe('مرة أخرى');
  });
});
