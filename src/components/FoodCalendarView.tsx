import React from 'react';
import { FoodMoment } from '../types';
import { MOODS } from '../data/momentsData';
import { Calendar as CalendarIcon, Clock, MapPin, Star, Flame, Plus } from 'lucide-react';
import { useLanguage, type AppLanguage } from '../i18n';

interface FoodCalendarViewProps {
  moments: FoodMoment[];
  onSelectMoment: (moment: FoodMoment) => void;
  onOpenAddModal: () => void;
}

const localeByLanguage: Record<AppLanguage,string>={en:'en-US',de:'de-DE',fr:'fr-FR',ar:'ar'};
const copy:Record<AppLanguage,{
  archive:string;title:string;description:string;add:string;today:string;yesterday:string;entry:string;entries:string;home:string;timeSuffix:string;
  categories:Record<string,string>;moods:Record<string,string>;
}>={
  en:{archive:'Chronological archive',title:'Journal & timeline',description:'Your food journey day by day, ordered by breakfast, lunch and dinner.',add:'Add entry',today:'Today',yesterday:'Yesterday',entry:'entry',entries:'entries',home:'Home',timeSuffix:'',categories:{breakfast:'Breakfast',lunch:'Lunch',dinner:'Dinner',snack:'Snack',coffee:'Coffee & cake',dessert:'Dessert',drinks:'Drinks & bar',travel:'Culinary travel'},moods:{energized:'Energized',satisfied:'Satisfied',light:'Light',indulgent:'Indulgent',comfort:'Comfort food',joyful:'Joyful'}},
  de:{archive:'Chronologisches Archiv',title:'Tagebuch & Chronologie',description:'Deine kulinarische Reise Tag für Tag geordnet nach Frühstück, Mittag- und Abendessen.',add:'Eintrag erfassen',today:'Heute',yesterday:'Gestern',entry:'Eintrag',entries:'Einträge',home:'Zuhause',timeSuffix:' Uhr',categories:{breakfast:'Frühstück',lunch:'Mittagessen',dinner:'Abendessen',snack:'Snack',coffee:'Kaffee & Kuchen',dessert:'Dessert',drinks:'Getränke & Bar',travel:'Kulinarische Reise'},moods:{energized:'Energiegeladen',satisfied:'Satt & zufrieden',light:'Leicht',indulgent:'Genuss',comfort:'Wohlfühl-Essen',joyful:'Feierlich'}},
  fr:{archive:'Archive chronologique',title:'Journal & chronologie',description:'Votre parcours alimentaire jour après jour, classé par petit-déjeuner, déjeuner et dîner.',add:'Ajouter une entrée',today:"Aujourd’hui",yesterday:'Hier',entry:'entrée',entries:'entrées',home:'Maison',timeSuffix:'',categories:{breakfast:'Petit-déjeuner',lunch:'Déjeuner',dinner:'Dîner',snack:'En-cas',coffee:'Café & gâteau',dessert:'Dessert',drinks:'Boissons & bar',travel:'Voyage culinaire'},moods:{energized:'Énergique',satisfied:'Satisfait',light:'Léger',indulgent:'Gourmand',comfort:'Réconfortant',joyful:'Joyeux'}},
  ar:{archive:'الأرشيف الزمني',title:'اليوميات والتسلسل الزمني',description:'رحلتك مع الطعام يوماً بعد يوم، مرتبة حسب الفطور والغداء والعشاء.',add:'إضافة تدوينة',today:'اليوم',yesterday:'أمس',entry:'تدوينة',entries:'تدوينات',home:'المنزل',timeSuffix:'',categories:{breakfast:'فطور',lunch:'غداء',dinner:'عشاء',snack:'وجبة خفيفة',coffee:'قهوة وحلوى',dessert:'حلوى',drinks:'مشروبات',travel:'رحلة طعام'},moods:{energized:'مفعم بالطاقة',satisfied:'راضٍ',light:'خفيف',indulgent:'استمتاع',comfort:'طعام مريح',joyful:'سعيد'}},
};

export const FoodCalendarView: React.FC<FoodCalendarViewProps> = ({ moments,onSelectMoment,onOpenAddModal }) => {
  const {language}=useLanguage();
  const c=copy[language];
  const groupedMoments = React.useMemo(() => {
    const map = new Map<string, FoodMoment[]>();
    const sorted = [...moments].sort((a,b)=>new Date(`${b.date}T${b.time}`).getTime()-new Date(`${a.date}T${a.time}`).getTime());
    sorted.forEach((m)=>{const list=map.get(m.date)||[];list.push(m);map.set(m.date,list);});
    return Array.from(map.entries()).sort((a,b)=>b[0].localeCompare(a[0]));
  }, [moments]);

  const formatDayTitle=(dateStr:string)=>{
    try{
      const localDateKey=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
      const now=new Date();const yesterdayDate=new Date(now);yesterdayDate.setDate(now.getDate()-1);
      if(dateStr===localDateKey(now))return c.today;
      if(dateStr===localDateKey(yesterdayDate))return c.yesterday;
      const [y,m,d]=dateStr.split('-');
      return new Date(Number(y),Number(m)-1,Number(d)).toLocaleDateString(localeByLanguage[language],{weekday:'long',day:'2-digit',month:'short',year:'numeric'});
    }catch{return dateStr;}
  };

  return <div className="space-y-6 animate-in fade-in duration-200" dir={language==='ar'?'rtl':'ltr'}>
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/80 shadow-xs">
      <div><span className="text-xs font-semibold text-amber-600 block mb-1">{c.archive}</span><h2 className="font-display font-bold text-xl sm:text-2xl text-stone-900 flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-amber-600"/><span>{c.title}</span></h2><p className="text-xs text-stone-500 mt-1">{c.description}</p></div>
      <button onClick={onOpenAddModal} className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"><Plus className="w-4 h-4"/><span>{c.add}</span></button>
    </div>
    <div className="space-y-6" data-testid="moments-timeline">
      {groupedMoments.map(([dateKey,dayMoments])=>{const totalCalories=dayMoments.reduce((sum,m)=>sum+(m.nutrition?.calories||0),0);return <section key={dateKey} className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-stone-50/80 border-b border-stone-100 flex items-center justify-between"><div className="flex items-center gap-3"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"/><h3 className="font-display font-bold text-sm sm:text-base text-stone-800">{formatDayTitle(dateKey)}</h3><span className="text-xs text-stone-500">({dayMoments.length} {dayMoments.length===1?c.entry:c.entries})</span></div>{totalCalories>0&&<div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60"><Flame className="w-3.5 h-3.5 text-amber-600"/><span>~{totalCalories} kcal</span></div>}</div>
        <div className="divide-y divide-stone-100">{dayMoments.map((moment)=>{const mood=MOODS[moment.mood]||MOODS.satisfied;return <div key={moment.id} onClick={()=>onSelectMoment(moment)} className="p-4 hover:bg-stone-50 transition-colors cursor-pointer flex items-center gap-4 group">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200"><img src={moment.imageUrl} alt={moment.title} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/></div>
          <div className="flex-1 min-w-0 space-y-1"><div className="flex items-center gap-2"><span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-900">{c.categories[moment.category]||moment.category}</span><span className="text-xs text-stone-500 flex items-center gap-1"><Clock className="w-3 h-3 text-stone-400"/>{moment.time}{c.timeSuffix}</span><span className="text-xs" title={c.moods[moment.mood]||c.moods.satisfied}>{mood.emoji}</span></div><h4 className="font-display font-semibold text-sm sm:text-base text-stone-900 truncate group-hover:text-amber-600 transition-colors">{moment.title}</h4><div className="flex items-center gap-3 text-xs text-stone-500"><span className="truncate flex items-center gap-1"><MapPin className="w-3 h-3 text-amber-600 shrink-0"/>{moment.location||c.home}</span>{moment.nutrition?.calories&&<span className="shrink-0 flex items-center gap-0.5 text-stone-600"><Flame className="w-3 h-3 text-amber-500"/>{moment.nutrition.calories} kcal</span>}</div></div>
          <div className="flex items-center gap-1 text-amber-600 shrink-0 font-semibold text-sm"><Star className="w-4 h-4 fill-amber-400 text-amber-400"/><span>{moment.rating}</span></div>
        </div>;})}</div>
      </section>;})}
    </div>
  </div>;
};
