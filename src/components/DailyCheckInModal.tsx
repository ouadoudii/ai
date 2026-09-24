import React from 'react';
import { X,Moon,Sun,Utensils,ArrowRight,Check,BatteryCharging } from 'lucide-react';
import { DailyCheckIn,TimeOfDayPhase,FoodMood } from '../types';
import { MealVisualPicker } from './MealVisualPicker';
import { getLocalDateKey } from '../utils/dateKey';
import { getCurrentPhase } from '../utils/phaseAvailability';
import { useLanguage } from '../i18n';
import { dailyCheckInCopy } from '../dailyCheckInCopy';

interface DailyCheckInModalProps {
  isOpen:boolean;
  onClose:()=>void;
  onSaveCheckIn:(checkIn:Omit<DailyCheckIn,'id'|'createdAt'>)=>void;
  existingCheckInsCount?:number;
  phase?:TimeOfDayPhase|null;
}

const FOCUSABLE_SELECTOR='button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';
export const getCanonicalLocalTime=(date:Date):string=>`${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
export const resolveCheckInPhase=(requestedPhase?:TimeOfDayPhase|null,date=new Date()):TimeOfDayPhase=>requestedPhase||getCurrentPhase(date.getHours());

export const DailyCheckInModal:React.FC<DailyCheckInModalProps>=({isOpen,onClose,onSaveCheckIn,phase:requestedPhase})=>{
  const {language}=useLanguage();
  const copy=dailyCheckInCopy[language] ?? dailyCheckInCopy.en;
  const ar=language==='ar';
  const sessionPhaseRef=React.useRef<TimeOfDayPhase>(resolveCheckInPhase(requestedPhase));
  const wasOpenRef=React.useRef(false);
  if(isOpen&&!wasOpenRef.current)sessionPhaseRef.current=resolveCheckInPhase(requestedPhase);
  wasOpenRef.current=isOpen;
  const timePhase=sessionPhaseRef.current;
  const phase=copy.phase[timePhase];
  const [step,setStep]=React.useState(1);
  const [sleepHours,setSleepHours]=React.useState(7.5);
  const [sleepQuality,setSleepQuality]=React.useState(4);
  const [bedtime,setBedtime]=React.useState('23:00');
  const [wakeTime,setWakeTime]=React.useState('07:00');
  const [wakeFeeling,setWakeFeeling]=React.useState<'refreshed'|'normal'|'tired'|'exhausted'>('normal');
  const [sleepHoursTouched,setSleepHoursTouched]=React.useState(false);
  const [sleepQualityTouched,setSleepQualityTouched]=React.useState(false);
  const [bedtimeTouched,setBedtimeTouched]=React.useState(false);
  const [wakeTimeTouched,setWakeTimeTouched]=React.useState(false);
  const [wakeFeelingTouched,setWakeFeelingTouched]=React.useState(false);
  const [mealItems,setMealItems]=React.useState<string[]>([]);
  const [hungerBefore,setHungerBefore]=React.useState(3);
  const [fullnessAfter,setFullnessAfter]=React.useState(4);
  const [hungerTouched,setHungerTouched]=React.useState(false);
  const [fullnessTouched,setFullnessTouched]=React.useState(false);
  const [energyLevel,setEnergyLevel]=React.useState(3);
  const [mood,setMood]=React.useState<FoodMood>('satisfied');
  const [energyTouched,setEnergyTouched]=React.useState(false);
  const [moodTouched,setMoodTouched]=React.useState(false);
  const dialogRef=React.useRef<HTMLElement>(null);
  const closeButtonRef=React.useRef<HTMLButtonElement>(null);
  const onCloseRef=React.useRef(onClose);

  React.useEffect(()=>{onCloseRef.current=onClose},[onClose]);
  React.useEffect(()=>{
    if(isOpen){
      setStep(1);setMealItems([]);setHungerBefore(3);setFullnessAfter(4);setHungerTouched(false);setFullnessTouched(false);setEnergyLevel(3);setMood('satisfied');setEnergyTouched(false);setMoodTouched(false);setSleepHours(7.5);setSleepQuality(4);setBedtime('23:00');setWakeTime('07:00');setWakeFeeling('normal');setSleepHoursTouched(false);setSleepQualityTouched(false);setBedtimeTouched(false);setWakeTimeTouched(false);setWakeFeelingTouched(false);
    }
  },[isOpen]);
  React.useEffect(()=>{
    if(!isOpen)return;
    const previousFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
    const dialog=dialogRef.current;if(!dialog)return;
    const previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
    const frame=requestAnimationFrame(()=>closeButtonRef.current?.focus());
    const handleKeyDown=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();onCloseRef.current();return;}if(event.key!=='Tab')return;const candidates=Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTOR)) as HTMLElement[];const focusable=candidates.filter(element=>element.offsetParent!==null);if(!focusable.length){event.preventDefault();dialog.focus();return;}const first=focusable[0];const last=focusable[focusable.length-1];if(event.shiftKey&&(document.activeElement===first||!dialog.contains(document.activeElement))){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}};
    document.addEventListener('keydown',handleKeyDown);return ()=>{cancelAnimationFrame(frame);document.removeEventListener('keydown',handleKeyDown);document.body.style.overflow=previousOverflow;if(previousFocus?.isConnected)previousFocus.focus();};
  },[isOpen]);
  if(!isOpen)return null;

  const finish=()=>{const now=new Date();const hasSleepAnswer=sleepHoursTouched||sleepQualityTouched||bedtimeTouched||wakeTimeTouched||wakeFeelingTouched;onSaveCheckIn({date:getLocalDateKey(now),time:getCanonicalLocalTime(now),timeOfDay:timePhase,sleep:timePhase==='morning'&&hasSleepAnswer?{...(sleepHoursTouched?{durationHours:sleepHours}:{}),...(sleepQualityTouched?{quality:sleepQuality}:{}),...(bedtimeTouched?{bedtime}:{}),...(wakeTimeTouched?{wakeTime}:{}),...(wakeFeelingTouched?{wakeFeeling}:{})}:undefined,food:mealItems.length?{mealTitle:mealItems.join(' + '),category:timePhase==='morning'?'breakfast':timePhase==='midday'?'lunch':'dinner',...(hungerTouched?{hungerBefore}:{}),...(fullnessTouched?{fullnessAfter}:{})}:undefined,wellbeing:{...(energyTouched?{energyLevel}:{}),...(moodTouched?{mood}:{})},coachSummary:copy.summary});onClose();};
  const moods=copy.moods as readonly (readonly [FoodMood,string,string])[];const wake=copy.wake as readonly (readonly ['refreshed'|'normal'|'tired'|'exhausted',string,string])[];
  return <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-950/35 sm:p-4"><section ref={dialogRef} tabIndex={-1} className="w-full sm:max-w-lg max-h-[94vh] overflow-hidden bg-[#FBFAF7] rounded-t-[28px] sm:rounded-[28px] border border-stone-200 shadow-2xl flex flex-col" role="dialog" aria-modal="true" aria-labelledby="daily-checkin-title" aria-describedby="daily-checkin-description"><header className="px-5 pt-5 pb-4 flex items-start justify-between"><div className="flex gap-3"><div className="w-10 h-10 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-amber-700">{timePhase==='morning'?<Sun className="w-5 h-5"/>:timePhase==='midday'?<Utensils className="w-5 h-5"/>:<Moon className="w-5 h-5"/>}</div><div><p className="text-[11px] font-bold text-stone-500">{phase[0]} · {step}/2</p><h2 id="daily-checkin-title" className="text-xl font-display font-bold text-stone-900 mt-0.5">{phase[1]}</h2><p id="daily-checkin-description" className="text-xs text-stone-500 mt-1">{phase[2]}</p></div></div><button ref={closeButtonRef} onClick={onClose} aria-label={copy.close} className="p-2 rounded-xl text-stone-500"><X className="w-5 h-5"/></button></header><div className="h-1 bg-stone-200 mx-5 rounded-full overflow-hidden"><div className="h-full bg-amber-500" style={{width:`${step*50}%`}}/></div><div className="p-5 overflow-y-auto flex-1">{step===1&&timePhase==='morning'&&<div className="space-y-5"><div><div className="flex justify-between mb-2"><h3 className="font-bold">{copy.sleepHours}</h3><strong>{sleepHours} {copy.hours}</strong></div><input type="range" min="4" max="11" step="0.5" value={sleepHours} onChange={e=>{setSleepHours(+e.target.value);setSleepHoursTouched(true)}} className="w-full accent-amber-600"/></div><div className="grid grid-cols-2 gap-3"><label className="bg-white border rounded-2xl p-3 text-xs font-semibold">{copy.bedtime}<input aria-label={copy.bedtime} type="time" value={bedtime} onChange={e=>{setBedtime(e.target.value);setBedtimeTouched(true)}} className="mt-2 block w-full bg-transparent text-base"/></label><label className="bg-white border rounded-2xl p-3 text-xs font-semibold">{copy.wakeTime}<input aria-label={copy.wakeTime} type="time" value={wakeTime} onChange={e=>{setWakeTime(e.target.value);setWakeTimeTouched(true)}} className="mt-2 block w-full bg-transparent text-base"/></label></div><div><p className="text-sm font-semibold mb-2">{copy.sleepFeel}</p><div className="grid grid-cols-5 gap-2">{[1,2,3,4,5].map(n=><button key={n} onClick={()=>{setSleepQuality(n);setSleepQualityTouched(true)}} className={`h-11 rounded-xl border ${sleepQualityTouched&&sleepQuality===n?'bg-amber-500 text-white':'bg-white'}`}>{n}</button>)}</div></div><div><p className="text-sm font-semibold mb-2">{copy.wakeFeel}</p><div className="grid grid-cols-2 gap-2">{wake.map(([v,e,l])=><button key={v} onClick={()=>{setWakeFeeling(v);setWakeFeelingTouched(true)}} className={`p-3 rounded-xl border ${wakeFeelingTouched&&wakeFeeling===v?'bg-amber-50 border-amber-400':'bg-white'}`}><span>{e}</span><span className="text-sm font-semibold mx-2">{l}</span></button>)}</div></div></div>}{step===1&&timePhase!=='morning'&&<div className="space-y-5"><MealVisualPicker value={mealItems} onChange={setMealItems} timePhase={timePhase}/><div className="grid grid-cols-2 gap-3">{[[copy.hungry,hungerBefore,setHungerBefore,setHungerTouched],[copy.full,fullnessAfter,setFullnessAfter,setFullnessTouched]].map(([label,val,setter,setTouched],i)=><div key={i} className="bg-white border rounded-2xl p-3"><div className="flex justify-between text-xs mb-2"><span>{String(label)}</span><strong>{Number(val)}/5</strong></div><input type="range" min="1" max="5" value={Number(val)} onChange={e=>{(setter as React.Dispatch<React.SetStateAction<number>>)(+e.target.value);(setTouched as React.Dispatch<React.SetStateAction<boolean>>)(true)}} className="w-full accent-amber-600"/></div>)}</div></div>}{step===2&&<div className="space-y-6">{timePhase==='morning'&&<MealVisualPicker value={mealItems} onChange={setMealItems} timePhase="morning"/>}<div><div className="flex justify-between mb-3"><span className="font-bold flex gap-2"><BatteryCharging className="w-4 h-4"/>{copy.energy}</span><strong>{energyLevel}/5</strong></div><input type="range" min="1" max="5" value={energyLevel} onChange={e=>{setEnergyLevel(+e.target.value);setEnergyTouched(true)}} className="w-full accent-amber-600"/></div><div><p className="text-sm font-semibold mb-2">{copy.mood}</p><div className="grid grid-cols-3 gap-2">{moods.map(([v,e,l])=><button key={v} onClick={()=>{setMood(v);setMoodTouched(true)}} className={`py-3 rounded-2xl border ${moodTouched&&mood===v?'bg-amber-50 border-amber-400':'bg-white'}`}><span className="block text-xl">{e}</span><span className="text-xs font-semibold">{l}</span></button>)}</div></div><p className="text-xs text-stone-500 bg-white border rounded-2xl p-3">{copy.noWrong}</p></div>}</div><footer className="p-4 border-t bg-white flex justify-between"><button onClick={step===1?onClose:()=>setStep(1)} className="px-4 py-3 text-sm text-stone-500">{step===1?copy.notNow:copy.back}</button>{step<2?<button onClick={()=>setStep(2)} className="min-w-32 px-5 py-3 rounded-2xl bg-stone-900 text-white font-bold flex justify-center gap-2">{copy.next}<ArrowRight className={`w-4 h-4 ${ar?'rotate-180':''}`}/></button>:<button onClick={finish} className="min-w-32 px-5 py-3 rounded-2xl bg-amber-500 text-white font-bold flex justify-center gap-2"><Check className="w-4 h-4"/>{copy.done}</button>}</footer></section></div>;
};