import React from 'react';
import { describe,expect,it,beforeAll,afterAll } from 'vitest';
import { renderToString } from 'react-dom/server';
import { getFoodSuggestions } from './utils/foodSuggestions';
import { hasArabicFoodLabel,localizeFoodSuggestions } from './utils/arabicFoodNames';
import { LanguageProvider } from './i18n';
import { CaptureChoiceModal } from './components/CaptureChoiceModal';
import { AddMomentModal } from './components/AddMomentModal';
import { DailyCheckInModal } from './components/DailyCheckInModal';
import { CatchUpMiddayCheckInModal } from './components/CatchUpMiddayCheckInModal';
import { MomentDetailModal } from './components/MomentDetailModal';
import type { FoodMoment,MomentCategory } from './types';

const countries=['MA','DE','FR','IT','ES','TR','GB','US','IN','JP','MX'];
const dayCategories:MomentCategory[]=['breakfast','lunch','snack','dinner','coffee','dessert'];
const latinLeak=/\b(Today|Patterns|Add|Food|Morning|Midday|Evening|Search|Local suggestions|Hunger|Fullness|Energy|Save|Later|Back|Next|Share|Edit|Delete|Location|Rating|Note|Close)\b/;
const moment={id:'u-ar',title:'كسكس بسبع خضار',label:'الغداء',category:'lunch',date:'2026-09-02',time:'13:30',location:'الرباط',locationCategory:'home',imageUrl:'',rating:5,mood:'satisfied',hungerLevel:3,fullnessLevel:4,energyAfter:'neutral',tags:[],createdAt:1} as FoodMoment;
let oldStorage:any;
beforeAll(()=>{oldStorage=(globalThis as any).localStorage;(globalThis as any).localStorage={getItem:(k:string)=>k==='rhythm_language_v1'?'ar':null,setItem:()=>{},removeItem:()=>{}}});
afterAll(()=>{(globalThis as any).localStorage=oldStorage});

describe('Arabic user country and full-day simulation',()=>{
  for(const country of countries){
    it(`${country}: Arabic suggestions cover breakfast through evening`,()=>{
      for(const category of dayCategories){
        const raw=getFoodSuggestions(country,category);
        expect(raw.length,`${country}/${category}`).toBeGreaterThan(0);
        const visible=raw.slice(0,18);
        expect(visible.every(x=>hasArabicFoodLabel(x.name)),`${country}/${category} missing Arabic label: ${visible.filter(x=>!hasArabicFoodLabel(x.name)).map(x=>x.name).join(', ')}`).toBe(true);
        const localized=localizeFoodSuggestions(visible,'ar');
        expect(localized.every(x=>/[\u0600-\u06FF]/.test(x.name)),`${country}/${category}`).toBe(true);
      }
    });
  }

  it('unknown countries still get a fully Arabic global fallback',()=>{
    for(const category of dayCategories){
      const raw=getFoodSuggestions('ZZ',category).slice(0,18);
      expect(raw.length).toBeGreaterThan(0);
      expect(raw.every(x=>hasArabicFoodLabel(x.name))).toBe(true);
    }
  });

  it('live Arabic capture/check-in/detail screens do not leak common English UI labels',()=>{
    const shell=(node:React.ReactNode)=>renderToString(<LanguageProvider>{node}</LanguageProvider>);
    const html=[
      shell(<CaptureChoiceModal isOpen onClose={()=>{}} onFood={()=>{}} onTellCary={()=>{}} onQuickCheck={()=>{}}/>),
      shell(<AddMomentModal isOpen onClose={()=>{}} onSave={()=>{}}/>),
      shell(<DailyCheckInModal isOpen onClose={()=>{}} onSaveCheckIn={()=>{}}/>),
      shell(<CatchUpMiddayCheckInModal isOpen onClose={()=>{}} onSaveCheckIn={()=>{}}/>),
      shell(<MomentDetailModal moment={moment} onClose={()=>{}} onEdit={()=>{}} onDelete={()=>{}} onToggleFavorite={()=>{}}/>),
    ].join('\n');
    expect(html).toMatch(/[\u0600-\u06FF]/);
    expect(html).not.toMatch(latinLeak);
  });
});
