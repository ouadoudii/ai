import React from 'react';
import type {FoodMoment} from '../types';
import {useLanguage} from '../i18n';
import {getLocalDateKey} from '../utils/dateKey';
import {deriveMealDayCoverage} from '../utils/mealDayCoverage';

type Props={moments:FoodMoment[];referenceDate?:string};

const copy={
  en:{eyebrow:'Your week',title:(days:number)=>`${days} of the last 7 days are represented`,body:'Your journal is starting to show more of your real rhythm. No streak needed — each day you capture adds context.'},
  de:{eyebrow:'Deine Woche',title:(days:number)=>`${days} der letzten 7 Tage sind erfasst`,body:'Dein Journal zeigt immer mehr von deinem echten Rhythmus. Kein Streak nötig — jeder erfasste Tag gibt mehr Kontext.'},
  fr:{eyebrow:'Ta semaine',title:(days:number)=>`${days} des 7 derniers jours sont représentés`,body:'Ton journal montre de mieux en mieux ton rythme réel. Pas besoin de série — chaque journée notée ajoute du contexte.'},
  ar:{eyebrow:'أسبوعك',title:(days:number)=>`سجّلت لحظات في ${days} من آخر 7 أيام`,body:'يبدأ سجلك في إظهار إيقاعك الحقيقي بشكل أوضح. لا تحتاج إلى سلسلة متواصلة — كل يوم تسجله يضيف سياقاً.'},
} as const;

export const MealDayCoverageCard:React.FC<Props>=({moments,referenceDate})=>{
  const {language}=useLanguage();
  const coverage=deriveMealDayCoverage(moments,referenceDate||getLocalDateKey());
  if(!coverage)return null;
  const c=copy[language as keyof typeof copy]||copy.en;
  return <section data-testid="meal-day-coverage" className="mt-4 rounded-[26px] border border-[#E5DED2] bg-[#F8F4EC] p-5 text-start">
    <p className="text-[11px] font-black uppercase tracking-[.14em] text-[#718565]">{c.eyebrow}</p>
    <h3 className="mt-2 text-lg font-black text-[#30332E]">{c.title(coverage.days)}</h3>
    <p className="mt-2 text-sm leading-6 text-[#77736B]">{c.body}</p>
    <div aria-label={`${coverage.days}/${coverage.windowDays}`} className="mt-4 grid grid-cols-7 gap-1.5">{Array.from({length:coverage.windowDays},(_,i)=><span key={i} className={`h-2 rounded-full ${i<coverage.days?'bg-[#64823D]':'bg-[#DDD7CC]'}`}/>)}</div>
  </section>;
};
