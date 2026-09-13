import React from 'react';
import { X,Moon,Sun,Utensils,ArrowRight,Check,BatteryCharging } from 'lucide-react';
import { DailyCheckIn,TimeOfDayPhase,FoodMood } from '../types';
import { MealVisualPicker } from './MealVisualPicker';
import { getLocalDateKey } from '../utils/dateKey';
import { useLanguage } from '../i18n';

interface DailyCheckInModalProps {
  isOpen:boolean;
  onClose:()=>void;
  onSaveCheckIn:(checkIn:Omit<DailyCheckIn,'id'|'createdAt'>)=>void;
  existingCheckInsCount?:number;
  phase?:TimeOfDayPhase|null;
}

const copyByLanguage = {
  en: {
    phase: {
      morning:['Your morning','How did your day begin?','One quick minute helps us understand your sleep and your start.'],
      midday:['Your midday','How is your day going?','Capture your meal and body signals in a few seconds.'],
      evening:['Your evening','How did today feel?','A quick moment about dinner and energy completes today’s picture.'],
    },
    close:'Close', sleepHours:'How long did you sleep?', hours:'h', sleepFeel:'How did your sleep feel?',
    wakeFeel:'How did you feel when you woke up?', hungry:'How hungry were you?', full:'How full did you feel after?',
    energy:'How is your energy right now?', mood:'What feels closest right now?',
    noWrong:'There is no right or wrong answer. We collect real moments and look for what repeats over time.',
    notNow:'Not now', back:'Back', next:'One more step', done:'Done',
    summary:'Nice. This moment added another piece to your picture. The connections will get clearer over time.',
    moods:[['energized','⚡','Energized'],['satisfied','🙂','Good'],['comfort','😌','Calm']],
    wake:[['refreshed','☀️','Refreshed'],['normal','🙂','Okay'],['tired','🥱','Tired'],['exhausted','😴','Exhausted']],
  },
  de: {
    phase: {
      morning:['Dein Morgen','Wie hat dein Tag begonnen?','Eine kurze Minute hilft uns, deinen Schlaf und deinen Start zu verstehen.'],
      midday:['Dein Mittag','Wie läuft dein Tag?','Halte deine Mahlzeit und Körpersignale in wenigen Sekunden fest.'],
      evening:['Dein Abend','Wie hat sich dein Tag angefühlt?','Ein kurzer Moment zu Abendessen und Energie vervollständigt das Bild deines Tages.'],
    },
    close:'Schließen', sleepHours:'Wie lange hast du geschlafen?', hours:'Std.', sleepFeel:'Wie hat sich dein Schlaf angefühlt?',
    wakeFeel:'Wie hast du dich beim Aufwachen gefühlt?', hungry:'Wie hungrig warst du?', full:'Wie satt hast du dich danach gefühlt?',
    energy:'Wie ist deine Energie gerade?', mood:'Was passt gerade am besten?',
    noWrong:'Es gibt keine richtige oder falsche Antwort. Wir sammeln echte Momente und schauen, was sich mit der Zeit wiederholt.',
    notNow:'Nicht jetzt', back:'Zurück', next:'Noch ein Schritt', done:'Fertig',
    summary:'Gut. Dieser Moment ergänzt dein Bild. Mit der Zeit werden Zusammenhänge klarer.',
    moods:[['energized','⚡','Energiegeladen'],['satisfied','🙂','Gut'],['comfort','😌','Ruhig']],
    wake:[['refreshed','☀️','Erholt'],['normal','🙂','Okay'],['tired','🥱','Müde'],['exhausted','😴','Erschöpft']],
  },
  fr: {
    phase: {
      morning:['Ton matin','Comment ta journée a-t-elle commencé ?','Une petite minute nous aide à comprendre ton sommeil et ton début de journée.'],
      midday:['Ton midi','Comment se passe ta journée ?','Note ton repas et les signaux de ton corps en quelques secondes.'],
      evening:['Ta soirée','Comment s’est passée ta journée ?','Un court moment sur le dîner et ton énergie complète l’image de ta journée.'],
    },
    close:'Fermer', sleepHours:'Combien de temps as-tu dormi ?', hours:'h', sleepFeel:'Comment as-tu dormi ?',
    wakeFeel:'Comment t’es-tu senti au réveil ?', hungry:'À quel point avais-tu faim ?', full:'À quel point étais-tu rassasié après ?',
    energy:'Comment est ton énergie maintenant ?', mood:'Qu’est-ce qui te correspond le mieux maintenant ?',
    noWrong:'Il n’y a pas de bonne ou de mauvaise réponse. Nous recueillons des moments réels pour repérer ce qui se répète avec le temps.',
    notNow:'Pas maintenant', back:'Retour', next:'Encore une étape', done:'Terminé',
    summary:'Bien. Ce moment ajoute une pièce à ton tableau. Les liens deviendront plus clairs avec le temps.',
    moods:[['energized','⚡','Énergique'],['satisfied','🙂','Bien'],['comfort','😌','Calme']],
    wake:[['refreshed','☀️','Reposé'],['normal','🙂','Ça va'],['tired','🥱','Fatigué'],['exhausted','😴','Épuisé']],
  },
  ar: {
    phase: {
      morning:['صباحك','كيف بدأت يومك؟','دقيقة صغيرة تساعدنا نفهم نومك وبداية يومك.'],
      midday:['منتصف يومك','كيف يسير يومك؟','سجّل وجبتك وإشارات جسمك بسرعة.'],
      evening:['مساؤك','كيف كان يومك؟','لحظة قصيرة عن العشاء والطاقة تكمل صورة اليوم.'],
    },
    close:'إغلاق', sleepHours:'كم ساعة نمت؟', hours:'س', sleepFeel:'كيف كان نومك؟',
    wakeFeel:'كيف شعرت عند الاستيقاظ؟', hungry:'قبل الأكل، كم كان جوعك؟', full:'وبعدها، كم شعرت بالشبع؟',
    energy:'كيف طاقتك الآن؟', mood:'وأقرب شعور لك الآن؟',
    noWrong:'لا توجد إجابة صحيحة أو خاطئة. نحن نجمع لحظات حقيقية لنرى ما يتكرر مع الوقت.',
    notNow:'ليس الآن', back:'رجوع', next:'خطوة أخيرة', done:'تم',
    summary:'جميل. هذه اللحظة أضافت جزءاً جديداً لصورتك. مع الوقت ستصبح الروابط أوضح.',
    moods:[['energized','⚡','مليء بالطاقة'],['satisfied','🙂','مرتاح'],['comfort','😌','هادئ']],
    wake:[['refreshed','☀️','منتعش'],['normal','🙂','عادي'],['tired','🥱','متعب'],['exhausted','😴','مرهق']],
  },
} as const;

export const DailyCheckInModal:React.FC<DailyCheckInModalProps>=({isOpen,onClose,onSaveCheckIn,phase:requestedPhase})=>{
  const {language}=useLanguage();
  const copy=copyByLanguage[language] ?? copyByLanguage.en;
  const ar=language==='ar';
  const hour=new Date().getHours();
  const timePhase:TimeOfDayPhase=requestedPhase||(hour>=5&&hour<11?'morning':hour>=11&&hour<16?'midday':'evening');
  const phase=copy.phase[timePhase];
  const [step,setStep]=React.useState(1);
  const [sleepHours,setSleepHours]=React.useState(7.5);
  const [sleepQuality,setSleepQuality]=React.useState(4);
  const [wakeFeeling,setWakeFeeling]=React.useState<'refreshed'|'normal'|'tired'|'exhausted'>('normal');
  const [mealItems,setMealItems]=React.useState<string[]>([]);
  const [hungerBefore,setHungerBefore]=React.useState(3);
  const [fullnessAfter,setFullnessAfter]=React.useState(4);
  const [energyLevel,setEnergyLevel]=React.useState(3);
  const [mood,setMood]=React.useState<FoodMood>('satisfied');

  React.useEffect(()=>{if(isOpen)setStep(1)},[isOpen]);
  if(!isOpen)return null;

  const finish=()=>{
    const now=new Date();
    onSaveCheckIn({
      date:getLocalDateKey(now),
      time:now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),
      timeOfDay:timePhase,
      sleep:timePhase==='morning'?{durationHours:sleepHours,quality:sleepQuality,wakeFeeling}:undefined,
      food:mealItems.length?{mealTitle:mealItems.join(' + '),category:timePhase==='morning'?'breakfast':timePhase==='midday'?'lunch':'dinner',hungerBefore,fullnessAfter,eatingPace:'moderate',distraction:'mindful'}:undefined,
      wellbeing:{energyLevel,mood,stressLevel:2,waterGlasses:0},
      coachSummary:copy.summary
    });
    onClose();
  };

  const moods=copy.moods as readonly (readonly [FoodMood,string,string])[];
  const wake=copy.wake as readonly (readonly ['refreshed'|'normal'|'tired'|'exhausted',string,string])[];

  return <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-950/35 sm:p-4">
    <section className="w-full sm:max-w-lg max-h-[94vh] overflow-hidden bg-[#FBFAF7] rounded-t-[28px] sm:rounded-[28px] border border-stone-200 shadow-2xl flex flex-col" role="dialog" aria-modal="true">
      <header className="px-5 pt-5 pb-4 flex items-start justify-between">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-amber-700">{timePhase==='morning'?<Sun className="w-5 h-5"/>:timePhase==='midday'?<Utensils className="w-5 h-5"/>:<Moon className="w-5 h-5"/>}</div>
          <div><p className="text-[11px] font-bold text-stone-500">{phase[0]} · {step}/2</p><h2 className="text-xl font-display font-bold text-stone-900 mt-0.5">{phase[1]}</h2><p className="text-xs text-stone-500 mt-1">{phase[2]}</p></div>
        </div>
        <button onClick={onClose} aria-label={copy.close} className="p-2 rounded-xl text-stone-500"><X className="w-5 h-5"/></button>
      </header>
      <div className="h-1 bg-stone-200 mx-5 rounded-full overflow-hidden"><div className="h-full bg-amber-500" style={{width:`${step*50}%`}}/></div>
      <div className="p-5 overflow-y-auto flex-1">
        {step===1&&timePhase==='morning'&&<div className="space-y-5">
          <div><div className="flex justify-between mb-2"><h3 className="font-bold">{copy.sleepHours}</h3><strong>{sleepHours} {copy.hours}</strong></div><input type="range" min="4" max="11" step="0.5" value={sleepHours} onChange={e=>setSleepHours(+e.target.value)} className="w-full accent-amber-600"/></div>
          <div><p className="text-sm font-semibold mb-2">{copy.sleepFeel}</p><div className="grid grid-cols-5 gap-2">{[1,2,3,4,5].map(n=><button key={n} onClick={()=>setSleepQuality(n)} className={`h-11 rounded-xl border ${sleepQuality===n?'bg-amber-500 text-white':'bg-white'}`}>{n}</button>)}</div></div>
          <div><p className="text-sm font-semibold mb-2">{copy.wakeFeel}</p><div className="grid grid-cols-2 gap-2">{wake.map(([v,e,l])=><button key={v} onClick={()=>setWakeFeeling(v)} className={`p-3 rounded-xl border ${wakeFeeling===v?'bg-amber-50 border-amber-400':'bg-white'}`}><span>{e}</span><span className="text-sm font-semibold mx-2">{l}</span></button>)}</div></div>
        </div>}
        {step===1&&timePhase!=='morning'&&<div className="space-y-5"><MealVisualPicker value={mealItems} onChange={setMealItems} timePhase={timePhase}/><div className="grid grid-cols-2 gap-3">{[[copy.hungry,hungerBefore,setHungerBefore],[copy.full,fullnessAfter,setFullnessAfter]].map(([label,val,setter],i)=><div key={i} className="bg-white border rounded-2xl p-3"><div className="flex justify-between text-xs mb-2"><span>{String(label)}</span><strong>{Number(val)}/5</strong></div><input type="range" min="1" max="5" value={Number(val)} onChange={e=>(setter as React.Dispatch<React.SetStateAction<number>>)(+e.target.value)} className="w-full accent-amber-600"/></div>)}</div></div>}
        {step===2&&<div className="space-y-6">
          {timePhase==='morning'&&<MealVisualPicker value={mealItems} onChange={setMealItems} timePhase="morning"/>}
          <div><div className="flex justify-between mb-3"><span className="font-bold flex gap-2"><BatteryCharging className="w-4 h-4"/>{copy.energy}</span><strong>{energyLevel}/5</strong></div><input type="range" min="1" max="5" value={energyLevel} onChange={e=>setEnergyLevel(+e.target.value)} className="w-full accent-amber-600"/></div>
          <div><p className="text-sm font-semibold mb-2">{copy.mood}</p><div className="grid grid-cols-3 gap-2">{moods.map(([v,e,l])=><button key={v} onClick={()=>setMood(v)} className={`py-3 rounded-2xl border ${mood===v?'bg-amber-50 border-amber-400':'bg-white'}`}><span className="block text-xl">{e}</span><span className="text-xs font-semibold">{l}</span></button>)}</div></div>
          <p className="text-xs text-stone-500 bg-white border rounded-2xl p-3">{copy.noWrong}</p>
        </div>}
      </div>
      <footer className="p-4 border-t bg-white flex justify-between">
        <button onClick={step===1?onClose:()=>setStep(1)} className="px-4 py-3 text-sm text-stone-500">{step===1?copy.notNow:copy.back}</button>
        {step<2?<button onClick={()=>setStep(2)} className="min-w-32 px-5 py-3 rounded-2xl bg-stone-900 text-white font-bold flex justify-center gap-2">{copy.next}<ArrowRight className={`w-4 h-4 ${ar?'rotate-180':''}`}/></button>:<button onClick={finish} className="min-w-32 px-5 py-3 rounded-2xl bg-amber-500 text-white font-bold flex justify-center gap-2"><Check className="w-4 h-4"/>{copy.done}</button>}
      </footer>
    </section>
  </div>;
};
