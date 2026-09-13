import React from 'react';
import { ArrowRight, Check, Compass, Sparkles } from 'lucide-react';
import { DailyCheckIn, TimeOfDayPhase } from '../types';
import { getLocalDateKey } from '../utils/dateKey';
import { INTRO_PROFILE_SAVED_EVENT, IntroProfile, loadIntroProfile } from '../utils/introProfile';
import { trackUx } from '../utils/uxAnalytics';
import { useLanguage } from '../i18n';

interface Props{
  checkIns:DailyCheckIn[];
  onOpenCheckIn:(phase:TimeOfDayPhase)=>void;
}

const seededIds=new Set(['checkin-1','checkin-2','checkin-3']);

export const PersonalPlanHomeCard:React.FC<Props>=({checkIns,onOpenCheckIn})=>{
  const {language}=useLanguage();
  const [profile,setProfile]=React.useState<IntroProfile|null>(()=>loadIntroProfile());

  React.useEffect(()=>{
    const refresh=()=>setProfile(loadIntroProfile());
    window.addEventListener(INTRO_PROFILE_SAVED_EVENT,refresh);
    window.addEventListener('storage',refresh);
    return()=>{
      window.removeEventListener(INTRO_PROFILE_SAVED_EVENT,refresh);
      window.removeEventListener('storage',refresh);
    };
  },[]);

  if(!profile)return null;

  const copy=language==='de'
    ?{eyebrow:'Dein persönlicher Start',why:'Warum dieser Fokus',next:'Dein nächster Schritt',cta:'Check-in starten',done:'Heute schon festgehalten',phase:{morning:'Morgen',midday:'Mittag',evening:'Abend'}}
    :language==='fr'
      ?{eyebrow:'Ton départ personnalisé',why:'Pourquoi ce focus',next:'Ta prochaine étape',cta:'Commencer le check-in',done:'Déjà noté aujourd’hui',phase:{morning:'Matin',midday:'Midi',evening:'Soir'}}
      :language==='ar'
        ?{eyebrow:'بدايتك الشخصية',why:'لماذا هذا التركيز',next:'خطوتك التالية',cta:'ابدأ تسجيلك',done:'تم تسجيل هذه اللحظة اليوم',phase:{morning:'الصباح',midday:'الظهر',evening:'المساء'}}
        :{eyebrow:'Your personal start',why:'Why this focus',next:'Your next step',cta:'Start check-in',done:'Already captured today',phase:{morning:'Morning',midday:'Midday',evening:'Evening'}};

  const plan=profile.firstPlan;
  const today=getLocalDateKey();
  const completed=checkIns.some(check=>check.date===today&&check.timeOfDay===plan.phase&&!seededIds.has(check.id));

  const start=()=>{
    if(completed)return;
    trackUx({eventName:'personal_plan_checkin_started',surface:'today_personal_plan',language,metadata:{phase:plan.phase,focus_count:plan.focusAreas.length}});
    onOpenCheckIn(plan.phase);
  };

  return <section data-testid="personal-plan-home" className="relative mt-4 overflow-hidden rounded-[30px] border border-white/70 bg-[#FFFDF8]/97 p-5 text-[#2D312C] shadow-[0_18px_42px_rgba(45,35,25,.18)] backdrop-blur-xl sm:p-6" dir={language==='ar'?'rtl':'ltr'}>
    <div className="absolute -end-12 -top-12 h-36 w-36 rounded-full bg-[#E8EEDC]" aria-hidden="true"/>
    <div className="relative">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-[#617054]"><Compass className="h-4 w-4"/>{copy.eyebrow}</span>
        <span data-testid="personal-plan-phase" className="rounded-full bg-[#EEF2E6] px-3 py-1.5 text-xs font-black text-[#526B48]">{copy.phase[plan.phase]}</span>
      </div>
      <h2 data-testid="personal-plan-title" className="mt-4 text-2xl font-display font-black leading-tight sm:text-3xl">{plan.title}</h2>
      {plan.rationale&&<div className="mt-4"><p className="text-xs font-black text-[#7D7B73]">{copy.why}</p><p className="mt-1 text-sm font-medium leading-6 text-[#5E625B]">{plan.rationale}</p></div>}
      {plan.focusAreas.length>0&&<div className="mt-4 flex flex-wrap gap-2">{plan.focusAreas.map(area=><span key={area} className="rounded-full bg-[#F0EBDD] px-3 py-1.5 text-xs font-black text-[#5D6655]">{area}</span>)}</div>}
      <div className="mt-5 rounded-[22px] bg-[#F5F0E7] p-4">
        <p className="flex items-center gap-2 text-xs font-black text-[#6C705F]"><Sparkles className="h-4 w-4"/>{copy.next}</p>
        <p data-testid="personal-plan-first-step" className="mt-2 text-sm font-bold leading-6 text-[#343831]">{plan.firstStep}</p>
      </div>
      <button data-testid="personal-plan-primary-action" type="button" onClick={start} aria-disabled={completed} className={`mt-5 flex min-h-14 w-full items-center justify-between rounded-2xl px-5 py-3 text-start font-black transition ${completed?'cursor-default bg-[#E7EBDD] text-[#617054]':'bg-[#293D34] text-white active:scale-[.99]'}`}>
        <span className="inline-flex items-center gap-2">{completed?<Check className="h-5 w-5"/>:null}{completed?copy.done:copy.cta}</span>
        {!completed&&<ArrowRight className={`h-5 w-5 ${language==='ar'?'rotate-180':''}`}/>} 
      </button>
    </div>
  </section>;
};
