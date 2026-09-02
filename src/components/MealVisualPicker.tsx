import React from 'react';
import { Globe2, Search } from 'lucide-react';
import { TimeOfDayPhase, MomentCategory } from '../types';
import { getFoodSuggestions, inferCountryFromLocale } from '../utils/foodSuggestions';
import { localizeFoodSuggestions } from '../utils/arabicFoodNames';
import { useLanguage } from '../i18n';

interface MealVisualPickerProps { value:string; onChange:(value:string)=>void; timePhase:TimeOfDayPhase; }
const categoryForPhase=(phase:TimeOfDayPhase):MomentCategory=>phase==='morning'?'breakfast':phase==='midday'?'lunch':'dinner';
export const MealVisualPicker:React.FC<MealVisualPickerProps>=({value,onChange,timePhase})=>{
  const {language}=useLanguage();
  const ar=language==='ar';
  const [country,setCountry]=React.useState<string|null>(null);
  React.useEffect(()=>{setCountry(inferCountryFromLocale());fetch('/api/locale').then(r=>r.ok?r.json():null).then(d=>{if(d?.country)setCountry(String(d.country).toUpperCase())}).catch(()=>undefined)},[]);
  const category=categoryForPhase(timePhase);
  const all=React.useMemo(()=>getFoodSuggestions(country,category),[country,category]);
  const localized=React.useMemo(()=>localizeFoodSuggestions(all,language,value),[all,language,value]);
  const popular=React.useMemo(()=>localizeFoodSuggestions(all.slice(0,12),language),[all,language]);
  const shown=value.trim()?localized.slice(0,18):popular;
  const exact=shown.some(o=>o.name.toLocaleLowerCase(ar?'ar':'en')===value.trim().toLocaleLowerCase(ar?'ar':'en'));
  return <div>
    <label className="block relative"><Search className={`absolute ${ar?'right-4':'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400`}/><input value={value} onChange={e=>onChange(e.target.value)} placeholder={ar?'ابحث أو اكتب أي وجبة…':'Search or type any meal…'} className={`w-full rounded-2xl border border-stone-200 bg-white py-3.5 ${ar?'pr-11 pl-4 text-right':'pl-11 pr-4'} text-sm outline-none focus:border-amber-400`}/></label>
    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-stone-500"><Globe2 className="w-3.5 h-3.5"/>{country?(ar?`اقتراحات محلية لـ ${country} أولاً`:`Local suggestions for ${country} first`):(ar?'اقتراحات محلية عند توفر البلد':'Local suggestions when location is available')}</div>
    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{shown.map(item=><button key={item.name} type="button" onClick={()=>onChange(item.name)} className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold ${value===item.name?'bg-amber-500 border-amber-500 text-white':'bg-white border-stone-200 text-stone-700'}`}>{item.name}</button>)}</div>
    {value.trim()&&!exact&&<p className="mt-2 text-xs text-stone-500">{ar?'سيتم حفظ اسم وجبتك كما كتبته تماماً.':'Your own meal name will be saved exactly as typed.'}</p>}
  </div>
}
