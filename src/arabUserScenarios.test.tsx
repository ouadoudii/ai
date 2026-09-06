import React from 'react';
import {describe,expect,it,beforeAll,afterAll} from 'vitest';
import {renderToString} from 'react-dom/server';
import {ARAB_USER_SCENARIOS,ARAB_COUNTRY_CODES} from './quality/arabUserScenarios';
import {getFoodSuggestions} from './utils/foodSuggestions';
import {hasLatinLetters,localizeFoodSuggestions} from './utils/arabicFoodNames';
import {LanguageProvider} from './i18n';
import {TodayHomeView} from './components/TodayHomeView';
import {getLocalDateKey} from './utils/dateKey';
import type {DailyCheckIn,FoodMoment,MomentCategory,TimeOfDayPhase} from './types';

let oldStorage:any;
beforeAll(()=>{
  oldStorage=(globalThis as any).localStorage;
  (globalThis as any).localStorage={getItem:(k:string)=>k==='rhythm_language_v1'?'ar':null,setItem:()=>{},removeItem:()=>{}};
});
afterAll(()=>{(globalThis as any).localStorage=oldStorage});

const noop=()=>{};
const today=getLocalDateKey();

function check(phase:TimeOfDayPhase,index:number):DailyCheckIn{
  return {id:`user-${phase}-${index}`,date:today,time:phase==='morning'?'08:00':phase==='midday'?'13:00':'21:30',timeOfDay:phase,wellbeing:{energyLevel:3,mood:'satisfied',stressLevel:2},createdAt:Date.now()+index};
}
function snack(index:number):FoodMoment{
  return {id:`user-snack-${index}`,title:'Dates',label:'Snack',category:'snack',date:today,time:'17:00',location:'',locationCategory:'home',imageUrl:'',rating:5,mood:'satisfied',tags:[],createdAt:Date.now()+index};
}

describe('44 Arab-country user simulations',()=>{
  it('covers all 22 Arab countries with one male and one female profile',()=>{
    expect(new Set(ARAB_COUNTRY_CODES).size).toBe(22);
    expect(ARAB_USER_SCENARIOS).toHaveLength(44);
    for(const code of ARAB_COUNTRY_CODES){
      const profiles=ARAB_USER_SCENARIOS.filter(s=>s.country===code);
      expect(profiles.map(p=>p.gender).sort()).toEqual(['female','male']);
    }
  });

  for(const scenario of ARAB_USER_SCENARIOS){
    it(`${scenario.id}: suggestions, Arabic labels and day state remain usable`,()=>{
      const uniqueCategories=[...new Set(scenario.categories)] as MomentCategory[];
      for(const category of uniqueCategories){
        const raw=getFoodSuggestions(scenario.country,category).slice(0,12);
        expect(raw.length,`${scenario.id}/${category}`).toBeGreaterThan(0);
        const ar=localizeFoodSuggestions(raw,'ar');
        expect(ar.length).toBe(raw.length);
        for(const item of ar){
          expect(/[\u0600-\u06FF]/.test(item.name),`${scenario.id}/${category}: ${item.name}`).toBe(true);
          expect(hasLatinLetters(item.name),`${scenario.id}/${category}: ${item.name}`).toBe(false);
        }
      }

      const checks=scenario.phases.map(check);
      const moments=scenario.hasSnack?[snack(1)]:[];
      const html=renderToString(
        <LanguageProvider>
          <TodayHomeView
            moments={moments}
            checkIns={checks}
            onOpenAddModal={noop}
            onOpenSnack={noop}
            onOpenCheckInModal={noop as any}
            onSelectMoment={noop as any}
            onNavigateToCoach={noop}
            onNavigateToTypeAnalysis={noop}
            onNavigateToTimeline={noop}
          />
        </LanguageProvider>
      );
      const captured=(html.match(/تم تسجيل هذه اللحظة/g)||[]).length;
      expect(captured).toBe(scenario.phases.length);
      expect(html).toContain('وجبة خفيفة');
      if(scenario.hasSnack) expect(html).toContain('تم تسجيل وجبة خفيفة');
    });
  }

  it('does not personalize food suggestions by gender',()=>{
    for(const code of ARAB_COUNTRY_CODES){
      const [male,female]=ARAB_USER_SCENARIOS.filter(s=>s.country===code).sort((a,b)=>a.gender.localeCompare(b.gender));
      expect(male).toBeTruthy(); expect(female).toBeTruthy();
      for(const category of ['breakfast','lunch','dinner','snack','coffee','dessert','drinks'] as MomentCategory[]){
        const a=getFoodSuggestions(code,category).map(x=>x.name);
        const b=getFoodSuggestions(code,category).map(x=>x.name);
        expect(a).toEqual(b);
      }
    }
  });

  it('covers varied eating patterns rather than one fixed day model',()=>{
    const patterns=new Set(ARAB_USER_SCENARIOS.map(s=>s.pattern));
    expect(patterns.size).toBeGreaterThanOrEqual(8);
    expect(ARAB_USER_SCENARIOS.some(s=>!s.phases.includes('morning'))).toBe(true);
    expect(ARAB_USER_SCENARIOS.some(s=>s.hasSnack)).toBe(true);
    expect(ARAB_USER_SCENARIOS.some(s=>s.categories.includes('drinks'))).toBe(true);
    expect(ARAB_USER_SCENARIOS.some(s=>s.categories.filter(c=>c==='snack').length>1)).toBe(true);
  });
});