import React from 'react';
import { Pin, RotateCcw } from 'lucide-react';
import type { FoodMoment } from '../types';
import { useLanguage } from '../i18n';
import { derivePinnedMeals, PINNED_MEALS_CHANGED_EVENT, PINNED_MEALS_STORAGE_KEY, readPinnedMealIds } from '../pinnedMeals';
import { trackUx } from '../utils/uxAnalytics';

interface Props { moments:FoodMoment[]; onRepeatMeal?:(moment:FoodMoment)=>void; }

const copy={
  en:{title:'Pinned meals',body:'Your staples stay ready, even when they are not recent.',action:'Use again'},
  de:{title:'Angeheftete Mahlzeiten',body:'Deine Favoriten bleiben griffbereit, auch wenn sie nicht aktuell sind.',action:'Erneut verwenden'},
  fr:{title:'Repas épinglés',body:'Tes repas essentiels restent à portée de main, même s’ils ne sont pas récents.',action:'Réutiliser'},
  ar:{title:'الوجبات المثبّتة',body:'تبقى وجباتك الأساسية جاهزة حتى لو لم تكن حديثة.',action:'استخدمها مجدداً'},
} as const;

export const PinnedMealsShortcutCard:React.FC<Props>=({moments,onRepeatMeal})=>{
  const {language}=useLanguage();
  const locale=(language==='de'||language==='fr'||language==='ar'?language:'en') as keyof typeof copy;
  const [pinnedIds,setPinnedIds]=React.useState<string[]>(()=>readPinnedMealIds());
  React.useEffect(()=>{
    const refresh=()=>setPinnedIds(readPinnedMealIds());
    window.addEventListener(PINNED_MEALS_CHANGED_EVENT,refresh);
    const onStorage=(event:StorageEvent)=>{if(event.key===PINNED_MEALS_STORAGE_KEY)refresh()};
    window.addEventListener('storage',onStorage);
    return()=>{window.removeEventListener(PINNED_MEALS_CHANGED_EVENT,refresh);window.removeEventListener('storage',onStorage)};
  },[]);
  const pinned=React.useMemo(()=>derivePinnedMeals(moments,pinnedIds),[moments,pinnedIds]);
  if(!onRepeatMeal||pinned.length===0)return null;
  const repeat=(moment:FoodMoment)=>{trackUx({eventName:'pinned_meal_repeated',surface:'today',language,metadata:{category:moment.category}});onRepeatMeal(moment)};
  return <section data-testid="pinned-meals-shortcuts" className="mt-5 rounded-[26px] border border-[#DDE7D7] bg-[#F2F6EE] p-4 sm:p-5"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#DFE9D8] text-[#526B48]"><Pin className="h-4 w-4 fill-current"/></span><div><h2 className="font-display text-lg font-black text-[#30362D]">{copy[locale].title}</h2><p className="mt-1 text-xs leading-5 text-[#687064]">{copy[locale].body}</p></div></div><div className="mt-4 flex flex-wrap gap-2">{pinned.map(moment=><button key={moment.id} type="button" data-testid={`repeat-pinned-meal-${moment.id}`} onClick={()=>repeat(moment)} className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border border-[#CFDDC7] bg-white px-4 py-2 text-start text-sm font-black text-[#526B48] shadow-sm" aria-label={`${copy[locale].action}: ${moment.title}`}><RotateCcw className="h-4 w-4 shrink-0"/><span className="truncate">{copy[locale].action} · {moment.title}</span></button>)}</div></section>;
};
