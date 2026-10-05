import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PersonalPlanHomeCard } from './components/PersonalPlanHomeCard';
import { INTRO_PROFILE_STORAGE_KEY } from './utils/introProfile';

const store = new Map<string,string>();
const localStorageStub = {
  getItem:(key:string)=>store.get(key) ?? null,
  setItem:(key:string,value:string)=>{store.set(key,value)},
  removeItem:(key:string)=>{store.delete(key)},
  clear:()=>store.clear(),
};

const profile={summary:'Test',priorities:[],preferences:[],rawIntro:'Test',confirmedAt:1,firstPlan:{title:'Your first step',rationale:'Test',focusAreas:[],firstStep:'Notice',phase:'midday'}};
const lunch=(id:string,time:string)=>({id,title:'Lunch',category:'lunch',time,date:'2026-09-29',createdAt:1}) as any;

describe('PersonalPlanHomeCard live state',()=>{
  beforeEach(()=>{
    store.clear();
    store.set(INTRO_PROFILE_STORAGE_KEY,JSON.stringify(profile));
    store.set('nimmapp_moments_v1',JSON.stringify([]));
    store.set('nimmapp_checkins_v1',JSON.stringify([]));
    vi.stubGlobal('localStorage',localStorageStub);
  });

  it('derives priorities from current props instead of the stale persisted snapshot',()=>{
    const stale=renderToStaticMarkup(<PersonalPlanHomeCard onStart={vi.fn()} moments={[]} checkIns={[]}/>);
    expect(stale).not.toContain('data-testid="today-priorities"');

    const liveMoments=[lunch('live-1','14:20'),lunch('live-2','14:35'),lunch('live-3','14:10')];
    const fresh=renderToStaticMarkup(<PersonalPlanHomeCard onStart={vi.fn()} moments={liveMoments} checkIns={[]}/>);
    expect(fresh).toContain('data-testid="today-priorities"');
    expect(JSON.parse(store.get('nimmapp_moments_v1')||'[]')).toEqual([]);
  });
});
