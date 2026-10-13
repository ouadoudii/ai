import {describe,it,expect} from 'vitest';
import {filterMoments} from './momentFilters';
import type {FoodMoment} from '../types';
const meal={id:'a',title:'کُسْکُسِی ۲',category:'lunch',date:'2026-10-13',time:'12:00',tags:[],isFavorite:true} as FoodMoment;
describe('Arabic journal search keyboard tolerance',()=>{
 it('finds Persian-script meal using Arabic script and western digits',()=>{
  expect(filterMoments([meal],'all','كسكسى 2')).toEqual([meal]);
  expect(filterMoments([meal],'favorites','كسكسي ٢')).toEqual([meal]);
  expect(filterMoments([meal],'all','كسكسي 9')).toEqual([]);
  expect(filterMoments([{...meal,id:'b',title:'طــاجين'}],'all','طاجين').map(m=>m.id)).toEqual(['b']);
  expect(filterMoments([{...meal,id:'c',title:'شوربة ٣',notes:'بيض ۴'}],'all','بيض 4','all',new Date(),'notes').map(m=>m.id)).toEqual(['c']);
  expect(meal.title).toBe('کُسْکُسِی ۲');
 });
});
