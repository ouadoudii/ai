import React from 'react';
import {describe,expect,it,beforeAll,afterAll} from 'vitest';
import {renderToString} from 'react-dom/server';
import {LanguageProvider} from './i18n';
import {TodayHomeView} from './components/TodayHomeView';
import {MobileBottomNav} from './components/MobileBottomNav';
import type {DailyCheckIn,FoodMoment} from './types';
import {getLocalDateKey} from './utils/dateKey';

let oldStorage:any;
beforeAll(()=>{oldStorage=(globalThis as any).localStorage;(globalThis as any).localStorage={getItem:(k:string)=>k==='rhythm_language_v1'?'ar':null,setItem:()=>{},removeItem:()=>{}}});
afterAll(()=>{(globalThis as any).localStorage=oldStorage});

const noop=()=>{};
const moment:FoodMoment={id:'user-legacy',title:'Neapolitanische Pizza',label:'Dinner',category:'dinner',date:getLocalDateKey(),time:'20:10',location:'',locationCategory:'home',imageUrl:'',rating:5,mood:'satisfied',tags:[],createdAt:Date.now()};
const check=(phase:'morning'|'midday'|'evening'):DailyCheckIn=>({id:'user-'+phase,date:getLocalDateKey(),time:'12:00',timeOfDay:phase,wellbeing:{energyLevel:3,mood:'satisfied',stressLevel:2,waterGlasses:2},createdAt:Date.now()});

describe('Arabic mobile UX day simulation',()=>{
  it('uses the zellige wall and Arabic-only visible home copy',()=>{
    const html=renderToString(<LanguageProvider><TodayHomeView moments={[moment]} checkIns={[]} onOpenAddModal={noop} onOpenCheckInModal={noop} onSelectMoment={noop as any} onNavigateToCoach={noop} onNavigateToTypeAnalysis={noop} onNavigateToTimeline={noop}/></LanguageProvider>);
    expect(html).toContain('/zellige-wall.svg');
    expect(html).toContain('مرحباً بك');
    expect(html).toContain('بيتزا نابولية');
    expect(html).not.toContain('Neapolitanische Pizza');
    expect(html).not.toContain('Welcome back');
  });

  it('renders morning, midday and evening as completed after a full simulated day',()=>{
    const html=renderToString(<LanguageProvider><TodayHomeView moments={[]} checkIns={[check('morning'),check('midday'),check('evening')]} onOpenAddModal={noop} onOpenCheckInModal={noop} onSelectMoment={noop as any} onNavigateToCoach={noop} onNavigateToTypeAnalysis={noop} onNavigateToTimeline={noop}/></LanguageProvider>);
    expect((html.match(/تم تسجيل هذه اللحظة/g)||[]).length).toBe(3);
  });

  it('keeps the five-item Arabic mobile navigation free of English labels',()=>{
    const html=renderToString(<LanguageProvider><MobileBottomNav activeTab="today" setActiveTab={noop as any} onCapture={noop} favoriteCount={0}/></LanguageProvider>);
    expect(html).toContain('اكتشافاتك');
    expect(html).toContain('لحظاتي');
    expect(html).toContain('اليوم');
    expect(html).toContain('اللغة');
    expect(html).not.toMatch(/Discoveries|My moments|Language/);
  });
});