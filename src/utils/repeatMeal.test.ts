import { describe,expect,it } from 'vitest';
import type { FoodMoment } from '../types';
import { getFavoriteRepeatCandidates } from './repeatMeal';

const moment=(id:string,title:string,createdAt:number,isFavorite=true,category:FoodMoment['category']='lunch')=>({id,title,label:'Meal',category,date:'2026-09-28',time:'12:00',location:'',imageUrl:'',rating:5,mood:'satisfied',tags:[],createdAt,isFavorite} as FoodMoment);

describe('getFavoriteRepeatCandidates',()=>{
  it('returns only favorites, newest first, with a stable limit',()=>{
    const result=getFavoriteRepeatCandidates([
      moment('old','Harira',1),moment('ordinary','Soup',5,false),moment('new','Couscous',4),moment('third','Tajine',3),moment('fourth','Salad',2),
    ],3);
    expect(result.map(item=>item.id)).toEqual(['new','third','fourth']);
  });
  it('deduplicates the same dish/category and excludes demo moments',()=>{
    const result=getFavoriteRepeatCandidates([
      moment('new-harira','Harira',4),moment('old-harira','harira',2),moment('moment-2','Demo favorite',9),moment('breakfast-harira','Harira',3,true,'breakfast'),
    ]);
    expect(result.map(item=>item.id)).toEqual(['new-harira','breakfast-harira']);
  });
});
