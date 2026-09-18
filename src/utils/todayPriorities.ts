import { DailyCheckIn, FoodMoment } from '../types';
import { buildPatternInsights, CaryPatternInsight } from './patternInsights';

export type TodayPriorityLanguage='de'|'en'|'fr'|'ar';
export type TodayPriority={id:string;title:string;body:string;evidence:string;confidence:'Signal'|'Trend'|'Pattern'};

const COPY={
  en:{
    'sleep-energy':['Sleep and energy','Shorter nights and lower later energy are starting to appear together.'],
    'pace-energy':['Eating pace and energy','Rushed meals are starting to line up with how your energy feels afterwards.'],
    'lunch-rhythm':['Your lunch rhythm','Your recent lunch times are showing a repeatable rhythm worth watching today.'],
    'distraction-fullness':['Attention while eating','Distracted meals are starting to line up with how full you feel afterwards.'],
    evidence:(n:number,c:string)=>`${c} · based on ${n} real ${n===1?'entry':'entries'}`,
  },
  de:{
    'sleep-energy':['Schlaf und Energie','Kürzere Nächte und niedrigere Energie später am Tag tauchen zunehmend gemeinsam auf.'],
    'pace-energy':['Esstempo und Energie','Hektische Mahlzeiten zeigen zunehmend einen Zusammenhang damit, wie sich deine Energie danach anfühlt.'],
    'lunch-rhythm':['Dein Mittagsrhythmus','Deine letzten Mittagessen zeigen einen wiederkehrenden Rhythmus, auf den du heute achten kannst.'],
    'distraction-fullness':['Aufmerksamkeit beim Essen','Ablenkung beim Essen zeigt zunehmend einen Zusammenhang damit, wie satt du dich danach fühlst.'],
    evidence:(n:number,c:string)=>`${c} · basiert auf ${n} echten ${n===1?'Eintrag':'Einträgen'}`,
  },
  fr:{
    'sleep-energy':['Sommeil et énergie','Les nuits plus courtes et une énergie plus basse ensuite commencent à apparaître ensemble.'],
    'pace-energy':['Rythme des repas et énergie','Les repas pris rapidement commencent à coïncider avec ton niveau d’énergie ensuite.'],
    'lunch-rhythm':['Ton rythme du déjeuner','Tes derniers déjeuners montrent un rythme qui se répète et mérite ton attention aujourd’hui.'],
    'distraction-fullness':['Attention pendant les repas','Les repas avec distraction commencent à coïncider avec ta sensation de satiété ensuite.'],
    evidence:(n:number,c:string)=>`${c} · basé sur ${n} ${n===1?'entrée réelle':'entrées réelles'}`,
  },
  ar:{
    'sleep-energy':['النوم والطاقة','بدأت الليالي الأقصر وانخفاض الطاقة لاحقاً تظهر معاً في بياناتك.'],
    'pace-energy':['سرعة الأكل والطاقة','بدأ الأكل بسرعة يظهر مع تغيّر مستوى طاقتك بعد الوجبة.'],
    'lunch-rhythm':['إيقاع الغداء','مواعيد الغداء الأخيرة تُظهر إيقاعاً متكرراً يستحق الانتباه اليوم.'],
    'distraction-fullness':['الانتباه أثناء الأكل','بدأ التشتت أثناء الأكل يظهر مع اختلاف شعورك بالشبع بعد الوجبة.'],
    evidence:(n:number,c:string)=>`${c} · مبني على ${n} ${n===1?'إدخال حقيقي':'إدخالات حقيقية'}`,
  },
} as const;

const confidenceLabel=(confidence:CaryPatternInsight['confidence'],language:TodayPriorityLanguage)=>{
  const labels={en:{Signal:'Early signal',Trend:'Growing trend',Pattern:'Repeated pattern'},de:{Signal:'Frühes Signal',Trend:'Zunehmender Trend',Pattern:'Wiederholtes Muster'},fr:{Signal:'Signal précoce',Trend:'Tendance croissante',Pattern:'Schéma répété'},ar:{Signal:'إشارة مبكرة',Trend:'اتجاه يتضح',Pattern:'نمط متكرر'}} as const;
  return labels[language][confidence];
};

export function buildTodayPriorities(moments:FoodMoment[],checkIns:DailyCheckIn[],language:TodayPriorityLanguage):TodayPriority[]{
  const copy=COPY[language];
  return buildPatternInsights(moments,checkIns)
    .filter(insight=>insight.id!=='learning'&&insight.id in copy)
    .slice(0,2)
    .map(insight=>{const pair=copy[insight.id as keyof Omit<typeof copy,'evidence'>] as readonly [string,string];return {id:insight.id,title:pair[0],body:pair[1],evidence:copy.evidence(insight.evidenceCount,confidenceLabel(insight.confidence,language)),confidence:insight.confidence};});
}
