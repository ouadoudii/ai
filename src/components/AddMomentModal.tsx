import React from 'react';
import { Camera, Check, ChevronDown, Globe2, ImagePlus, Search, Sparkles, X } from 'lucide-react';
import { FoodMoment, MomentCategory } from '../types';
import { getLocalDateKey } from '../utils/dateKey';
import { getFoodSuggestions } from '../utils/foodSuggestions';
import { localizeFoodSuggestions } from '../utils/arabicFoodNames';
import { getDishPhoto } from '../utils/dishPhoto';
import { fetchFoodAutocomplete } from '../apiClient';
import { trackUx } from '../utils/uxAnalytics';
import { mergeAutocompleteSuggestions, rankLocalAutocomplete } from '../utils/foodAutocomplete';
import { addMealItem, buildMealTitle, removeMealItem } from '../utils/mealItems';
import { getFoodVisuals, localizeFoodVisualName, type FoodVisual } from '../utils/foodVisuals';
import { useLanguage } from '../i18n';

interface AddMomentModalProps { isOpen:boolean; onClose:()=>void; onSave:(momentData:Omit<FoodMoment,'id'|'createdAt'>)=>void; editingMoment?:FoodMoment|null; }
const categories:MomentCategory[]=['breakfast','lunch','dinner','snack','coffee','dessert'];
const enLabels:Record<MomentCategory,string>={breakfast:'Breakfast',lunch:'Lunch',dinner:'Dinner',snack:'Snack',coffee:'Coffee',dessert:'Dessert',drinks:'Drinks',travel:'Travel'};
const arLabels:Record<MomentCategory,string>={breakfast:'الفطور',lunch:'الغداء',dinner:'العشاء',snack:'وجبة خفيفة',coffee:'قهوة',dessert:'حلويات',drinks:'مشروبات',travel:'سفر'};
const categoryForHour=(hour:number):MomentCategory=>hour<11?'breakfast':hour<15?'lunch':hour<18?'snack':'dinner';
export const AddMomentModal:React.FC<AddMomentModalProps>=({isOpen,onClose,onSave,editingMoment})=>{
  const {language}=useLanguage(); const ar=language==='ar'; const labels=ar?arLabels:enLabels;
  const [category,setCategory]=React.useState<MomentCategory>('lunch');
  const [imageUrl,setImageUrl]=React.useState('');
  const [title,setTitle]=React.useState('');
  const [items,setItems]=React.useState<string[]>([]);
  const [notes,setNotes]=React.useState('');
  const [showMore,setShowMore]=React.useState(false);
  const [country,setCountry]=React.useState<string|null>(null);
  const [aiSuggestions,setAiSuggestions]=React.useState<string[]>([]);
  const [aiLoading,setAiLoading]=React.useState(false);
  const [focused,setFocused]=React.useState(false);
  const fileRef=React.useRef<HTMLInputElement>(null);
  const requestId=React.useRef(0);

  React.useEffect(()=>{if(!isOpen)return;setCountry(null);fetch('/api/locale',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>setCountry(data?.country?String(data.country).toUpperCase():null)).catch(()=>setCountry(null));if(editingMoment){setCategory(editingMoment.category);setImageUrl(editingMoment.imageUrl);setTitle('');setItems([editingMoment.title]);setNotes(editingMoment.notes||'');setShowMore(Boolean(editingMoment.notes));return;}const next=categoryForHour(new Date().getHours());setCategory(next);setImageUrl('');setTitle('');setItems([]);setNotes('');setShowMore(false);setAiSuggestions([])},[isOpen,editingMoment]);

  const all=React.useMemo(()=>getFoodSuggestions(country,category),[country,category]);
  const localizedAll=React.useMemo(()=>localizeFoodSuggestions(all,language),[all,language]);
  const localMatches=React.useMemo(()=>rankLocalAutocomplete(localizedAll.map(x=>x.name),title,6),[localizedAll,title]);
  const safeAiSuggestions=React.useMemo(()=>ar?aiSuggestions.filter(name=>/[\u0600-\u06FF]/.test(name)&&!/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(name)):aiSuggestions,[aiSuggestions,ar]);
  const mergedSuggestions=React.useMemo(()=>mergeAutocompleteSuggestions(localMatches,safeAiSuggestions,title,6),[localMatches,safeAiSuggestions,title]);
  const photoName=title.trim() || (items.length===1?items[0]:'');
  const matchedPhoto=React.useMemo(()=>photoName?getDishPhoto(photoName,category):null,[photoName,category]);
  const visualMatches=React.useMemo(()=>getFoodVisuals(category,title,18),[category,title]);

  React.useEffect(()=>{if(!isOpen||title.trim().length<2){setAiSuggestions([]);setAiLoading(false);return;}const q=title.trim();const id=++requestId.current;const timer=setTimeout(async()=>{setAiLoading(true);const results=await fetchFoodAutocomplete({query:q,category,language,country});if(id!==requestId.current)return;const safe=language==='ar'?results.filter(name=>/[\u0600-\u06FF]/.test(name)&&!/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(name)):results;setAiSuggestions(safe);setAiLoading(false);if(safe.length)trackUx({eventName:'autocomplete_returned',surface:'meal_editor',language,metadata:{source:'ai',count:safe.length,category}})},450);return()=>clearTimeout(timer)},[title,category,language,country,isOpen]);

  const chooseCategory=(next:MomentCategory)=>{setCategory(next);setTitle('');setItems([]);setImageUrl('');setAiSuggestions([])};
  const addItem=(name:string,source:'local'|'ai'|'typed')=>{const next=addMealItem(items,name);if(next.length===items.length){setTitle('');setFocused(true);return;}setItems(next);setTitle('');setAiSuggestions([]);setFocused(true);if(next.length===1){const photo=getDishPhoto(name,category);if(photo&&!imageUrl)setImageUrl(photo.url)}else if(imageUrl&&matchedPhoto&&imageUrl===matchedPhoto.url)setImageUrl('');trackUx({eventName:source==='typed'?'autocomplete_confirmed':'autocomplete_selected',surface:'meal_editor',language,metadata:{source,category,count:next.length}})};
  const chooseDish=(name:string,source:'local'|'ai'='local')=>addItem(name,source);
  const chooseVisual=(visual:FoodVisual)=>{const name=localizeFoodVisualName(visual,language);const next=addMealItem(items,name);setItems(next);setTitle('');setFocused(false);setAiSuggestions([]);setImageUrl(visual.imageUrl);trackUx({eventName:'food_image_selected',surface:'meal_editor',language,metadata:{source:'image_matrix',category,count:next.length}})};
  const changeTitle=(value:string)=>{setTitle(value);setFocused(true);if(items.length===0){const photo=getDishPhoto(value,category);if(photo)setImageUrl(photo.url);else if(imageUrl&&matchedPhoto&&imageUrl===matchedPhoto.url)setImageUrl('')}};
  const confirmTitle=()=>{if(!title.trim())return;addItem(title,'typed')};
  const handleKeyDown=(e:React.KeyboardEvent<HTMLInputElement>)=>{if(e.key==='Enter'){e.preventDefault();confirmTitle()}else if(e.key==='Escape'){setFocused(false)}};
  const handleUpload=(event:React.ChangeEvent<HTMLInputElement>)=>{const file=event.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{if(typeof reader.result==='string')setImageUrl(reader.result)};reader.readAsDataURL(file)};

  const save=()=>{const now=new Date();const mealTitle=buildMealTitle(items,title)||labels[category];onSave({title:mealTitle,label:labels[category],category,date:editingMoment?.date||getLocalDateKey(now),time:editingMoment?.time||now.toTimeString().slice(0,5),location:editingMoment?.location||(ar?'غير محدد':'Not specified'),locationCategory:editingMoment?.locationCategory||'home',imageUrl,rating:editingMoment?.rating||5,mood:editingMoment?.mood||'satisfied',hungerLevel:editingMoment?.hungerLevel,fullnessLevel:editingMoment?.fullnessLevel,eatingPace:editingMoment?.eatingPace,distraction:editingMoment?.distraction,energyAfter:editingMoment?.energyAfter,coachFeedback:editingMoment?.coachFeedback,notes:notes.trim()||undefined,tags:editingMoment?.tags||[],isFavorite:editingMoment?.isFavorite||false,nutrition:editingMoment?.nutrition||{},price:editingMoment?.price,companions:editingMoment?.companions});onClose()};
  if(!isOpen)return null;

  return <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-sm sm:p-4"><div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-[34px] sm:rounded-[34px] bg-[#F7F5F0] shadow-2xl">
    <div className="sticky top-0 z-10 flex items-center justify-between bg-[#F7F5F0]/95 px-5 pt-5 pb-3 backdrop-blur-xl"><div><p className="text-[11px] font-extrabold uppercase tracking-[.18em] text-[#8A867E]">{ar?'الطعام':'Food'}</p><h2 className="mt-1 text-2xl font-display font-black text-[#252824]">{ar?'ماذا أكلت؟':'What did you have?'}</h2></div><button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white border border-[#E5E0D7]" aria-label={ar?'إغلاق':'Close'}><X className="h-5 w-5"/></button></div>
    <div className="px-5 pb-6">
      <div className="flex gap-2 overflow-x-auto pb-2">{categories.map(item=><button key={item} onClick={()=>chooseCategory(item)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-extrabold ${item===category?'bg-[#252824] text-white':'bg-white border border-[#E5E0D7] text-[#66655F]'}`}>{labels[item]}</button>)}</div>

      <div className="mt-4 relative">
        <Search className={`absolute z-10 ${ar?'right-4':'left-4'} top-[26px] -translate-y-1/2 w-4 h-4 text-[#918D84]`}/>
        <input value={title} onFocus={()=>setFocused(true)} onChange={e=>changeTitle(e.target.value)} onKeyDown={handleKeyDown} placeholder={ar?'ابدأ بالكتابة… مثلاً طاجين':'Start typing… e.g. chicken pasta'} autoComplete="off" className={`w-full rounded-[22px] border ${items.length?'border-[#789267]':'border-[#DED8CF]'} bg-white py-4 ${ar?'pr-11 pl-14 text-right':'pl-11 pr-14'} text-[15px] font-semibold outline-none transition`}/>
        <button type="button" onClick={confirmTitle} disabled={!title.trim()} aria-label={ar?'تأكيد':'Confirm'} className={`absolute ${ar?'left-2':'right-2'} top-2 w-10 h-10 rounded-full grid place-items-center transition ${title.trim()?'bg-[#526B48] text-white':'bg-[#EEF1E8] text-[#526B48] disabled:opacity-35'}`}><Check className="w-5 h-5"/></button>

        {focused&&title.trim()&&<div className="absolute z-30 mt-2 w-full overflow-hidden rounded-[22px] border border-[#E4DDD2] bg-[#FFFDF9] shadow-[0_18px_45px_rgba(48,38,28,.16)]">
          <div className="px-4 pt-3 pb-2 flex items-center justify-between"><span className="text-[10px] font-black text-[#8A867E]">{ar?'اقتراحات ذكية':'Smart suggestions'}</span>{aiLoading&&<span className="flex items-center gap-1 text-[10px] font-bold text-[#6C7F60]"><Sparkles className="w-3 h-3 animate-pulse"/>{ar?'يفكر…':'Thinking…'}</span>}</div>
          {mergedSuggestions.length>0?<div className="pb-2">{mergedSuggestions.map(name=>{const ai=safeAiSuggestions.includes(name);return <button type="button" key={name} onMouseDown={e=>e.preventDefault()} onClick={()=>chooseDish(name,ai?'ai':'local')} className="w-full px-4 py-3 flex items-center gap-3 text-start hover:bg-[#F3EFE6] active:bg-[#ECE6DA]"><span className={`w-8 h-8 rounded-full grid place-items-center shrink-0 ${ai?'bg-[#E8EFE1] text-[#526B48]':'bg-[#F3EADF] text-[#9B704A]'}`}>{ai?<Sparkles className="w-4 h-4"/>:<Search className="w-4 h-4"/>}</span><span className="flex-1 text-sm font-bold text-[#373933]">{name}</span><span className="text-[#9A958D]">›</span></button>})}</div>:!aiLoading&&<div className="px-4 pb-4 text-xs text-[#77736B]">{ar?'لم نجد تطابقاً. يمكنك تأكيد ما كتبته بعلامة ✓':'No match yet. You can confirm what you typed with ✓.'}</div>}
        </div>}
      </div>

      {items.length>0&&<div className="mt-3 flex flex-wrap gap-2">{items.map((item,index)=><span key={`${item}-${index}`} className="inline-flex max-w-full items-center gap-2 rounded-full bg-[#E8EFE1] px-3 py-2 text-xs font-bold text-[#455744]"><span className="truncate">{item}</span><button type="button" onClick={()=>setItems(removeMealItem(items,index))} aria-label={ar?'حذف':'Remove'} className="grid h-5 w-5 place-items-center rounded-full bg-white/70 text-[#6A795F]"><X className="h-3 w-3"/></button></span>)}</div>}

      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#918D84]"><Globe2 className="w-3.5 h-3.5"/>{items.length?(ar?`تمت إضافة ${items.length} — يمكنك إضافة المزيد`:`${items.length} added — you can add more`):country?(ar?'نقترح أولاً ما يناسب منطقتك':'We prioritize what fits your region'):(ar?'اكتب فقط، وسنكمل معك':'Just type — we’ll help complete it')}</div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-3"><div><p className="text-xs font-black text-[#4A4C46]">{title.trim()?(ar?'صور تناسب ما كتبت':'Pictures matching what you typed'):(ar?'اختر بالصورة':'Choose by picture')}</p><p className="mt-0.5 text-[10px] text-[#918D84]">{title.trim()?(ar?'اضغط على الصورة لإضافتها مباشرة':'Tap a picture to add it instantly'):(ar?'أو ابدأ بالكتابة لتضييق الاختيارات':'Or start typing to narrow the choices')}</p></div><span className="rounded-full bg-[#E8EFE1] px-2.5 py-1 text-[10px] font-black text-[#526B48]">{visualMatches.length}</span></div>
        {visualMatches.length>0?<div className="grid grid-cols-3 gap-2">{visualMatches.map(visual=><button type="button" key={visual.id} onClick={()=>chooseVisual(visual)} className="group relative aspect-square overflow-hidden rounded-[18px] bg-[#EAE4D9] text-start shadow-[0_5px_16px_rgba(55,43,31,.08)]"><img src={visual.imageUrl} alt={localizeFoodVisualName(visual,language)} loading="lazy" className="h-full w-full object-cover transition duration-200 group-active:scale-[.98]"/><span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-2 pt-6 pb-2 text-[10px] font-black leading-tight text-white">{localizeFoodVisualName(visual,language)}</span></button>)}</div>:<div className="rounded-[20px] bg-[#F0ECE4] px-4 py-5 text-center text-xs text-[#77736B]">{ar?'لا توجد صور مطابقة بعد — يمكنك استخدام الاقتراحات الذكية أو تأكيد ما كتبته.':'No matching pictures yet — use a smart suggestion or confirm what you typed.'}</div>}
      </div>

      <div className="mt-5"><p className="mb-2 text-xs font-bold text-[#6F6C65]">{ar?'الصورة':'Photo'}</p><div className="grid grid-cols-2 gap-2">{matchedPhoto&&items.length<=1&&imageUrl===matchedPhoto.url&&<div className="relative aspect-[4/3] overflow-hidden rounded-[20px] border border-[#E5E0D7]"><img src={matchedPhoto.url} alt={title} className="w-full h-full object-cover"/><span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-1 text-[9px] font-bold text-white">{ar?'مطابقة للطبق':'Matched to dish'}</span></div>}<button onClick={()=>fileRef.current?.click()} className="aspect-[4/3] rounded-[20px] border-2 border-dashed border-[#D8D1C7] bg-white flex flex-col items-center justify-center text-[#77736B]"><Camera className="w-6 h-6"/><span className="mt-2 text-[10px] font-bold">{ar?'أضف صورتك':'Add your photo'}</span></button></div>{(title.trim()||items.length>0)&&!matchedPhoto&&!imageUrl&&<p className="mt-2 text-[11px] text-[#918D84]">{ar?'لن نعرض صورة عشوائية لا تطابق طبقك.':'We won’t show a random photo that does not match your dish.'}</p>}</div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleUpload} className="hidden"/>
      <button onClick={()=>setShowMore(v=>!v)} className="mt-5 flex w-full items-center justify-between rounded-[18px] bg-[#EFE9DE] px-4 py-3 text-sm font-bold text-[#5E5D57]"><span className="flex items-center gap-2"><ImagePlus className="w-4 h-4"/>{ar?'أضف ملاحظة':'Add a note'}</span><ChevronDown className={`w-4 h-4 ${showMore?'rotate-180':''}`}/></button>
      {showMore&&<textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder={ar?'معلومة إضافية اختيارية…':'Optional context…'} rows={3} className="mt-3 w-full resize-none rounded-[18px] bg-white px-4 py-3 text-sm outline-none border border-[#E1DBD2]"/>}
      <button onClick={save} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#E76F45] px-5 py-4 text-sm font-extrabold text-white"><Check className="h-5 w-5"/>{editingMoment?(ar?'حفظ التغييرات':'Save changes'):(ar?'حفظ الوجبة':'Save meal')}</button>
      <p className="mt-2 text-center text-[11px] text-[#99958C]">{ar?'اكتب القليل فقط — سنساعدك في الباقي.':'Type a little — we’ll help with the rest.'}</p>
    </div>
  </div></div>
};