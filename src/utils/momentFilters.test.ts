import { describe,expect,it } from 'vitest';
import { FoodMoment } from '../types';
import { filterMoments } from './momentFilters';

const moment=(id:string,isFavorite?:boolean)=>({id,title:id,label:'Meal',category:'lunch',date:'2026-09-28',time:'12:00',location:'Home',imageUrl:'',rating:5,mood:'satisfied',tags:[],createdAt:1,isFavorite} as FoodMoment);

describe('filterMoments',()=>{
  const moments=[moment('favorite',true),moment('ordinary',false),moment('legacy')];
  it('keeps the complete journal in all mode',()=>expect(filterMoments(moments,'all')).toEqual(moments));
  it('returns only explicitly favorited meals in favorites mode',()=>expect(filterMoments(moments,'favorites').map(item=>item.id)).toEqual(['favorite']));
});
