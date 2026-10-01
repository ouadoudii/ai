import { describe, expect, it } from 'vitest';
import type { FoodMoment } from './types';
import { getFavoriteRepeatCandidates } from './utils/repeatMeal';
const m=(id:string,title:string,createdAt:number,extra:Partial<FoodMoment>={}):FoodMoment=>({id,title,label:title,category:'breakfast',date:'2026-09-30',time:'08:00',location:'',imageUrl:'',rating:5,tags:[],createdAt,isFavorite:true,...extra} as FoodMoment);
describe('getFavoriteRepeatCandidates',()=>{
 it('returns newest unique real favorites only',()=>{const result=getFavoriteRepeatCandidates([m('old','بيض',1),m('new','بيض',3),m('tea','أتاي',2)],3);expect(result.map(x=>x.id)).toEqual(['new','tea']);});
 it('excludes demo, blank and non-favorite moments',()=>{expect(getFavoriteRepeatCandidates([m('moment-1','demo',4),m('blank',' ',3),m('plain','Msemen',2,{isFavorite:false})])).toEqual([]);});
 it('respects the requested limit',()=>{expect(getFavoriteRepeatCandidates([m('a','A',1),m('b','B',2),m('c','C',3)],2).map(x=>x.id)).toEqual(['c','b']);});
});
