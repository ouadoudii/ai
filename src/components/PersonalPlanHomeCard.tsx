import React from 'react';
import { ArrowRight, CheckCircle2, Compass, Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n';
import { loadIntroProfile, PlanPhase } from '../utils/introProfile';

interface Props{
  onStart:(phase:PlanPhase)=>void;
}

export const PersonalPlanHomeCard:React.FC<Props>=({onStart})=>{
  const {language}=useLanguage();
  const profile=loadIntroProfile();
  if(!profile)return null;

  const copy=language==='de'
    ?{eyebrow:'Dein persönlicher Start',why:'Warum das zu dir passt',next:'Dein nächster Schritt',phase:{morning:'Morgen-Check-in starten',midday:'Mittag-Check-in starten',evening:'Abend-Check-in starten'}}
    :language==='fr'
      ?{eyebrow:'Ton départ personnalisé',why:'Pourquoi cela te correspond',next:'Ta prochaine étape',phase:{morning:'Commencer le check-in du matin',midday:'Commencer le check-in de midi',evening:'Commencer le check-in du soir'}}
      :language==='ar'
        ?{eyebrow:'بدايتك الشخصية',why:'لماذا يناسبك هذا',next:'خطوتك التالية',phase:{morning:'ابدأ تسجيل الصباح',midday:'ابدأ تسجيل منتصف اليوم',evening:'ابدأ تسجيل المساء'}}
        :{eyebrow:'Your personal start',why:'Why this fits you',next:'Your next step',phase:{morning:'Start morning check-in',midday:'Start midday check-in',evening:'Start evening check-in'}};

  const {firstPlan}=profile;
  return <section data-testid="personal-plan-home-card" className="mb-5 rounded-[30px] border border-white/70 bg-[#FFFDF8]/97 p-5 text-[#2E302B] shadow-[0_16px_42px_rgba(45,35,25,.18)] backdrop-blur-xl sm:p-6" dir={language==='ar'?'rtl':'ltr'}>
    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#69785E]"><Sparkles className="h-4 w-4"/>{copy.eyebrow}</div>
    <div className="mt-3 flex items-start gap-3">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#E7EFE0] text-[#506747]"><Compass className="h-5 w-5"/></div>
      <div className="min-w-0 flex-1"><h2 className="text-2xl font-display font-black leading-tight sm:text-3xl">{firstPlan.title}</h2>{firstPlan.focusAreas.length>0&&<div className="mt-3 flex flex-wrap gap-2">{firstPlan.focusAreas.map(area=><span key={area} className="rounded-full bg-[#EEF3E9] px-3 py-1.5 text-xs font-black text-[#566C4D]">{area}</span>)}</div>}</div>
    </div>
    {firstPlan.rationale&&<div className="mt-5"><p className="text-xs font-black text-[#6B7067]">{copy.why}</p><p className="mt-1.5 text-sm leading-6 text-[#747067]">{firstPlan.rationale}</p></div>}
    <div className="mt-5 rounded-2xl bg-[#F2EEE6] p-4"><div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#5B7650]"/><div><p className="text-xs font-black text-[#6B7067]">{copy.next}</p><p data-testid="personal-plan-first-step" className="mt-1 text-sm font-bold leading-6 text-[#353932]">{firstPlan.firstStep}</p></div></div></div>
    <button data-testid="personal-plan-start" type="button" onClick={()=>onStart(firstPlan.phase)} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#293D34] px-5 py-3 font-black text-white shadow-sm transition-transform active:scale-[.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#293D34]/20">{copy.phase[firstPlan.phase]}<ArrowRight className={`h-4 w-4 ${language==='ar'?'rotate-180':''}`}/></button>
  </section>;
};
