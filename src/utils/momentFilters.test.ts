import { describe,expect,it } from 'vitest';
import { FoodMoment } from '../types';
import { filterMoments } from './momentFilters';

const moment=(id:string,isFavorite?:boolean,extra:Partial<FoodMoment>={})=>({id,title:id,label:'Meal',category:'lunch',date:'2026-09-28',time:'12:00',location:'Home',imageUrl:'',rating:5,mood:'satisfied',tags:[],createdAt:1,isFavorite,...extra} as FoodMoment);

describe('filterMoments',()=>{
  const moments=[moment('favorite',true,{title:'Crème brûlée',tags:['dessert']}),moment('ordinary',false,{title:'Harira',location:'Marrakech'}),moment('legacy',undefined,{title:'بيض مسلوق'}),moment('arabic-diacritics',true,{title:'حَرِيرَة Harira',location:'مَرَّاكُش',tags:['شُورْبَة']})];
  it('keeps the complete journal in all mode',()=>expect(filterMoments(moments,'all')).toEqual(moments));
  it('returns only explicitly favorited meals in favorites mode',()=>expect(filterMoments(moments,'favorites').map(item=>item.id)).toEqual(['favorite','arabic-diacritics']));
  it('searches title, location and tags accent-insensitively',()=>{
    expect(filterMoments(moments,'all','creme').map(item=>item.id)).toEqual(['favorite']);
    expect(filterMoments(moments,'all','marrakech').map(item=>item.id)).toEqual(['ordinary']);
    expect(filterMoments(moments,'all','dessert').map(item=>item.id)).toEqual(['favorite']);
  });
  it('supports Arabic and composes search with favorites',()=>{
    expect(filterMoments(moments,'all','بيض').map(item=>item.id)).toEqual(['legacy']);
    expect(filterMoments(moments,'favorites','harira').map(item=>item.id)).toEqual(['arabic-diacritics']);
  });
  it('matches Arabic harakat in either stored text or query without changing persisted text',()=>{
    expect(filterMoments(moments,'all','حريرة').map(item=>item.id)).toEqual(['arabic-diacritics']);
    expect(filterMoments([moment('plain',false,{title:'حريرة'})],'all','حَرِيرَة').map(item=>item.id)).toEqual(['plain']);
    expect(filterMoments(moments,'all','مراكش').map(item=>item.id)).toEqual(['arabic-diacritics']);
    expect(filterMoments(moments,'all','شوربة').map(item=>item.id)).toEqual(['arabic-diacritics']);
    expect(moments.find(item=>item.id==='arabic-diacritics')?.title).toBe('حَرِيرَة Harira');
  });
  it('filters by inclusive local calendar ranges and composes with favorites and search',()=>{
    const now=new Date(2026,8,29,12);
    const history=[moment('today',false,{date:'2026-09-29'}),moment('seven-edge',true,{date:'2026-09-23',title:'Harira'}),moment('eight-days',true,{date:'2026-09-22',title:'Harira'}),moment('thirty-edge',false,{date:'2026-08-31'}),moment('older',false,{date:'2026-08-30'})];
    expect(filterMoments(history,'all','','7d',now).map(item=>item.id)).toEqual(['today','seven-edge']);
    expect(filterMoments(history,'all','','30d',now).map(item=>item.id)).toEqual(['today','seven-edge','eight-days','thirty-edge']);
    expect(filterMoments(history,'favorites','harira','7d',now).map(item=>item.id)).toEqual(['seven-edge']);
    expect(filterMoments(history,'all','','all',now)).toEqual(history);
  });
});