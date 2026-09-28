import { describe,expect,it } from 'vitest';
import { FoodMoment } from '../types';
import { filterMoments } from './momentFilters';

const moment=(id:string,isFavorite?:boolean,extra:Partial<FoodMoment>={})=>({id,title:id,label:'Meal',category:'lunch',date:'2026-09-28',time:'12:00',location:'Home',imageUrl:'',rating:5,mood:'satisfied',tags:[],createdAt:1,isFavorite,...extra} as FoodMoment);

describe('filterMoments',()=>{
  const moments=[moment('favorite',true,{title:'Crème brûlée',tags:['dessert']}),moment('ordinary',false,{title:'Harira',location:'Marrakech'}),moment('legacy',undefined,{title:'بيض مسلوق'})];
  it('keeps the complete journal in all mode',()=>expect(filterMoments(moments,'all')).toEqual(moments));
  it('returns only explicitly favorited meals in favorites mode',()=>expect(filterMoments(moments,'favorites').map(item=>item.id)).toEqual(['favorite']));
  it('searches title, location and tags accent-insensitively',()=>{
    expect(filterMoments(moments,'all','creme').map(item=>item.id)).toEqual(['favorite']);
    expect(filterMoments(moments,'all','marrakech').map(item=>item.id)).toEqual(['ordinary']);
    expect(filterMoments(moments,'all','dessert').map(item=>item.id)).toEqual(['favorite']);
  });
  it('supports Arabic and composes search with favorites',()=>{
    expect(filterMoments(moments,'all','بيض').map(item=>item.id)).toEqual(['legacy']);
    expect(filterMoments(moments,'favorites','harira')).toEqual([]);
  });
});
