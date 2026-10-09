import { describe,expect,it } from 'vitest';
import { filterMoments } from '../src/utils/momentFilters';
import type { FoodMoment } from '../src/types';

const moment=(id:string,title:string,notes:string,isFavorite=false):FoodMoment=>({
  id,title,notes,isFavorite,label:'Meal',date:'2026-10-01',time:'12:00',category:'lunch',location:'Home',locationCategory:'home',imageUrl:'',
  rating:4,mood:'satisfied',tags:[],createdAt:Date.parse('2026-10-01T12:00:00.000Z')
});

describe('Journal note search scope',()=>{
  const moments=[
    moment('1','Training bowl','بعد التمرين avec Omar',true),
    moment('2','Après training','ordinary lunch note',true),
    moment('3','Meeting soup','réunion importante',false),
  ];

  it('keeps broad search across title and personal notes',()=>{
    expect(filterMoments(moments,'all','training','all',new Date(),'all').map(item=>item.id)).toEqual(['1','2']);
  });

  it('limits notes-only search to user-authored note text',()=>{
    expect(filterMoments(moments,'all','training','all',new Date(),'notes').map(item=>item.id)).toEqual([]);
    expect(filterMoments(moments,'all','avec omar','all',new Date(),'notes').map(item=>item.id)).toEqual(['1']);
  });

  it('composes notes-only scope with Favorites',()=>{
    expect(filterMoments(moments,'favorites','ordínary','all',new Date(),'notes').map(item=>item.id)).toEqual(['2']);
    expect(filterMoments(moments,'favorites','réunion','all',new Date(),'notes')).toEqual([]);
  });

  it('matches Arabic notes without harakat while preserving stored text',()=>{
    const arabic=moment('ar','بيض','بَعْدَ التَّمْرِين');
    expect(filterMoments([arabic],'all','بعد التمرين','all',new Date(),'notes')).toEqual([arabic]);
    expect(arabic.notes).toBe('بَعْدَ التَّمْرِين');
  });
});
