import React from 'react';
import { ArrowRight, CheckCircle2, Compass, Sparkles, Activity, Clock3 } from 'lucide-react';
import { useLanguage } from '../i18n';
import { loadIntroProfile, localizeIntroPlanFallback, PlanPhase } from '../utils/introProfile';
import { buildTodayPriorities, TodayPriorityLanguage } from '../utils/todayPriorities';
import { isPhaseAvailable, PHASE_START_HOUR } from '../utils/phaseAvailability';
import { DailyCheckIn, FoodMoment } from '../types';

interface Props{
  onStart:(phase:PlanPhase)=>void;
}

const readStored=<T,>(primary:string,legacy:string):T[]=>{try{const raw=localStorage.getItem(primary)||localStorage.getItem(legacy);return raw?JSON.parse(raw):[];}catch{return [];}};

export const PersonalPlanHomeCard:React.FC<Props>=({onStart})=>{
  const {language}=useLanguage();
  const profile=loadIntroProfile();
  if(!profile)return null;

  const lang=(['de','en','fr','ar'].includes(language)?language:'en') as TodayPriorityLanguage;
  const moments=readStored<FoodMoment>('nimmapp_moments_v1','food_journey_moments_v1');
  const checkIns=readStored<DailyCheckIn>('nimmapp_checkins_v1','getyourcoach_checkins_v1');
  const priorities=buildTodayPriorities(moments,checkIns,lang);

  const copy=language==='de'
    ?{eyebrow:'Heute wichtig',why:'Was deine Daten gerade zeigen',next:'Eine kleine Sache für heute',later:(time:string)=>`Ab ${time} verfügbar`,phase:{morning:'Morgen-Check-in starten',midday:'Mittag-Check-in starten',evening:'Abend-Check-in starten'}}
    :language==='fr'
      ?{eyebrow:'Important aujourd’hui',why:'Ce que montrent tes données',next:'Une petite action pour aujourd’hui',later:(time:string)=>`Disponible à partir de ${time}`,phase:{morning:'Commencer le check-in du matin',midday:'Commencer le check-in de midi',evening:'Commencer le check-in du soir'}}
      :language==='ar'
        ?{eyebrow:'المهم اليوم',why:'ما الذي تظهره بياناتك الآن',next:'خطوة صغيرة لليوم',later:(time:string)=>`متاح ابتداءً من ${time}`,phase:{morning:'ابدأ تسجيل الصباح',midday:'ابدأ تسجيل منتصف اليوم',evening:'ابدأ تسجيل المساء'}}
        :{eyebrow:'What matters today',why:'What your data is showing',next:'One small thing for today',later:(time:string)=>`Available from ${time}`,phase:{morning:'Start morning check-in',midday:'Start midday check-in',evening:'Start evening check-in'}};

  const firstPlan=localizeIntroPlanFallback(profile.firstPlan,language);
  const available=isPhaseAvailable(firstPlan.phase,new Date().getHours());
  const availableAt=`${String(PHASE_START_HOUR[firstPlan.phase]).padStart(2,'0')}:00`;
  return <section data-testid="personal-plan-home-card" className="mb-5 rounded-[30px] border border-white/70 bg-[#FFFDF8]/97 p-5 text-[#2E302B] shadow-[0_16px_42px_rgba(45,35,25,.18)] backdrop-blur-xl sm:p-6" dir={language==='ar'?'rtl':'ltr'}>
    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#69785E]"><Sparkles className="h-4 w-4"/>{copy.eyebrow}</div>
    {priorities.length>0?<div data-testid="today-priorities" className="mt-4 space-y-3">{priorities.map(priority=><div key={priority.id} className="rounded-2xl border border-[#E4EBDD] bg-[#F4F8F0] p-4"><div className="flex items-start gap-3"><div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#E3EDDC] text-[#506747]"><Activity className="h-4 w-4"/></div><div><h2 className="font-display text-lg font-black leading-tight">{priority.title}</h2><p className="mt-1.5 text-sm leading-6 text-[#5F665B]">{priority.body}</p><p className="mt-2 text-[11px] font-black text-[#718069]">{priority.evidence}</p></div></div></div>)}</div>:<div className="mt-3 flex items-start gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#E7EFE0] text-[#506747]"><Compass className="h-5 w-5"/></div><div className="min-w-0 flex-1"><h2 className="text-2xl font-display font-black leading-tight sm:text-3xl">{firstPlan.title}</h2>{firstPlan.focusAreas.length>0&&<div className="mt-3 flex flex-wrap gap-2">{firstPlan.focusAreas.map(area=><span key={area} className="rounded-full bg-[#EEF3E9] px-3 py-1.5 text-xs font-black text-[#566C4D]">{area}</span>)}</div>}</div></div>}
    {priorities.length===0&&firstPlan.rationale&&<div className="mt-5"><p className="text-xs font-black text-[#6B7067]">{copy.why}</p><p className="mt-1.5 text-sm leading-6 text-[#747067]">{firstPlan.rationale}</p></div>}
    <div className="mt-5 rounded-2xl bg-[#F2EEE6] p-4"><div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#5B7650]"/><div><p className="text-xs font-black text-[#6B7067]">{copy.next}</p><p data-testid="personal-plan-first-step" className="mt-1 text-sm font-bold leading-6 text-[#353932]">{firstPlan.firstStep}</p></div></div></div>
    {!available&&<p data-testid="personal-plan-available-later" className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-[#6B7067]"><Clock3 className="h-4 w-4"/>{copy.later(availableAt)}</p>}
    <button data-testid="personal-plan-start" type="button" disabled={!available} aria-disabled={!available} onClick={()=>{if(available)onStart(firstPlan.phase)}} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#293D34] px-5 py-3 font-black text-white shadow-sm transition-transform enabled:active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#293D34]/20">{copy.phase[firstPlan.phase]}<ArrowRight className={`h-4 w-4 ${language==='ar'?'rotate-180':''}`}/></button>
  </section>;
};