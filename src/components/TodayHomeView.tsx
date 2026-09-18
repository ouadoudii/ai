import React from 'react';
import { ArrowRight, Plus, Activity, Clock3, Sun, Sunset, Moon, Check, Sparkles, Sprout, Mic2 } from 'lucide-react';
import { FoodMoment, DailyCheckIn, TimeOfDayPhase } from '../types';
import { getLocalDateKey } from '../utils/dateKey';
import { buildPatternInsights } from '../utils/patternInsights';
import { localizeStoredFoodName } from '../utils/arabicFoodNames';
import { trackUx } from '../utils/uxAnalytics';
import { useLanguage } from '../i18n';
import { isPhaseAvailable } from '../utils/phaseAvailability';
import { shouldUseFullDayVoiceRecap, voiceHomePrompt } from '../utils/voiceHomePrompt';
import { PersonalPlanHomeCard } from './PersonalPlanHomeCard';

interface Props {
  moments:FoodMoment[];
  checkIns:DailyCheckIn[];
  onOpenAddModal:()=>void;
  onOpenVoiceJournal:()=>void;
  onOpenSnack:()=>void;
  onOpenCheckInModal:(phase:TimeOfDayPhase)=>void;
  onSelectMoment:(m:FoodMoment)=>void;
  onNavigateToCoach:()=>void;
  onNavigateToTypeAnalysis:()=>void;
  onNavigateToTimeline:()=>void;
  onSaveCheckIn?:(c:Omit<DailyCheckIn,'id'|'createdAt'>)=>void;
}

const demoM=(m:FoodMoment)=>/^moment-\d{1,2}$/.test(m.id);
const demoC=(c:DailyCheckIn)=>/^checkin-\d{1,2}$/.test(c.id);
const bg='/zellige-wall.svg';
const phaseIcon:Record<TimeOfDayPhase,React.ReactNode>={
  morning:<Sun className="w-7 h-7"/>,
  midday:<Sunset className="w-7 h-7"/>,
  evening:<Moon className="w-7 h-7"/>,
};

const frenchTodayCopy:Record<string,string>={
  'Good morning':'Bonjour','How did your day begin?':'Comment ta journée a-t-elle commencé ?','Midday':'Midi','Take a moment and capture what matters':'Prends un moment pour noter ce qui compte','Good evening':'Bonsoir','How did your day feel?':'Comment as-tu vécu ta journée ?','Welcome back 👋':'Bon retour 👋','Let’s understand your day a little better 🌿':'Comprenons un peu mieux ta journée 🌿','Capture your day':'Note ta journée','This moment is captured ✓':'Ce moment est enregistré ✓','Snack':'Collation','Snack captured ✓':'Collation enregistrée ✓','Add a snack if it was part of your day':'Ajoute une collation si elle faisait partie de ta journée','Your recent moments':'Tes moments récents','Add a moment':'Ajouter un moment','Another piece of the picture':'Une nouvelle pièce du puzzle','A moment helping us understand your rhythm':'Un moment qui nous aide à comprendre ton rythme','Start with one small moment':'Commence par un petit moment','A photo, your voice or a few taps is enough.':'Une photo, ta voix ou quelques gestes suffisent.','Every moment adds another piece':'Chaque moment ajoute une pièce','Something is starting to repeat':'Un schéma commence à se dessiner','Keep going your way. Useful connections will emerge from your real everyday life.':'Continue à ton rythme. Des liens utiles émergeront de ton quotidien réel.',
};

export const TodayHomeView:React.FC<Props>=({moments,checkIns,onOpenAddModal,onOpenVoiceJournal,onOpenSnack,onOpenCheckInModal,onSelectMoment,onNavigateToTypeAnalysis})=>{
  const {language,t}=useLanguage();
  const ar=language==='ar';const de=language==='de';const fr=language==='fr';
  const copy=(en:string,arText:string,deText:string)=>ar?arText:de?deText:fr?(frenchTodayCopy[en]||en):en;
  const today=getLocalDateKey();
  const todayChecks=checkIns.filter(c=>c.date===today&&!demoC(c));
  const completed=new Set<TimeOfDayPhase>(todayChecks.map(c=>c.timeOfDay));
  const completedKey=Array.from(completed).sort().join(',');
  const realMoments=moments.filter(m=>!demoM(m)).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  const snackDone=realMoments.some(m=>m.date===today&&m.category==='snack');
  const insights=React.useMemo(()=>buildPatternInsights(moments,checkIns),[moments,checkIns]);
  const first=insights[0];
  const date=new Intl.DateTimeFormat(ar?'ar-MA':de?'de-DE':fr?'fr-FR':'en',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
  const hour=new Date().getHours();
  const [fullDayMode,setFullDayMode]=React.useState(false);
  React.useEffect(()=>{setFullDayMode(shouldUseFullDayVoiceRecap(new Date().getHours(),completed));},[completedKey]);
  const voicePrompt=voiceHomePrompt(language,fullDayMode);
  const allPhases:Array<{key:TimeOfDayPhase;title:string;body:string;accent:string;soft:string}>=[
    {key:'morning',title:copy('Good morning','صباح الخير','Guten Morgen'),body:copy('How did your day begin?','كيف بدأ يومك؟','Wie hat dein Tag begonnen?'),accent:'#D99B1D',soft:'#FFF1CE'},
    {key:'midday',title:copy('Midday','منتصف اليوم','Mittag'),body:copy('Take a moment and capture what matters','خذ لحظة وسجّل ما يهم','Nimm dir einen Moment und halte fest, was wichtig ist'),accent:'#64823D',soft:'#E9F0D8'},
    {key:'evening',title:copy('Good evening','مساء الخير','Guten Abend'),body:copy('How did your day feel?','كيف كان يومك؟','Wie hat sich dein Tag angefühlt?'),accent:'#7565B0',soft:'#EEE9F7'},
  ];
  const phases=allPhases.filter(p=>isPhaseAvailable(p.key,hour));
  const openVoice=()=>{trackUx({eventName:'voice_home_tapped',surface:'today',language,metadata:{mode:fullDayMode?'full_day':'open_voice'}});onOpenVoiceJournal();};
  const openPhase=(phase:TimeOfDayPhase)=>{if(completed.has(phase))return;onOpenCheckInModal(phase)};
  return <div className="mx-auto max-w-[860px] pb-28 md:pb-10 md:pt-4"><section className="relative overflow-hidden -mx-3 sm:mx-0 rounded-b-[42px] sm:rounded-[42px] min-h-[620px] sm:min-h-[680px] shadow-[0_28px_80px_rgba(66,48,29,.22)] bg-[#c8ab81]" style={{backgroundImage:`linear-gradient(180deg,rgba(50,44,31,.22),rgba(50,44,31,.48)),url(${bg})`,backgroundSize:'auto,520px',backgroundPosition:'center'}}><div className="relative px-5 sm:px-9 pt-7 sm:pt-10 pb-10 text-white"><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-[#FFFDF7]/94 text-[#455744] px-4 py-2 text-xs font-black">{date}</span><Sprout/></div><div className="mt-8"><h1 className="text-4xl font-display font-black">{copy('Welcome back 👋','مرحباً بك 👋','Willkommen zurück 👋')}</h1></div><button data-testid="voice-home-mic" data-full-day-recap={fullDayMode?'true':'false'} onClick={openVoice} className="mt-7 w-full rounded-[34px] bg-[#FFFDF8]/98 p-5 text-[#2E302B] text-start"><div className="flex items-center gap-5"><span className="grid h-24 w-24 place-items-center rounded-full bg-[#526B48] text-white"><Mic2 className="h-11 w-11"/></span><span><strong className="block text-2xl font-black">{voicePrompt.title}</strong><span className="block mt-2">{voicePrompt.body}</span><span className="block mt-3">{voicePrompt.cta}</span></span></div></button>{!fullDayMode&&<div>{phases.map(p=><button key={p.key} onClick={()=>openPhase(p.key)}>{phaseIcon[p.key]} {p.title}</button>)}</div>}<PersonalPlanHomeCard moments={moments} checkIns={checkIns}/><button onClick={onOpenAddModal}><Plus/> {t('addMoment')}</button>{first&&<button onClick={onNavigateToTypeAnalysis}><Activity/> {first.title}</button>}{realMoments.slice(0,3).map(m=><button key={m.id} onClick={()=>onSelectMoment(m)}><Clock3/>{localizeStoredFoodName(m.title,language)}<ArrowRight/></button>)}{snackDone&&<Check/>}<Sparkles/></div></section></div>;
};
