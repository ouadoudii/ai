import React from 'react';
import { ArrowLeft, Camera, Check, ChevronDown, Globe2, ImagePlus, LoaderCircle, Search, Sparkles, X } from 'lucide-react';
import { FoodMoment, MomentCategory } from '../types';
import { getLocalDateKey } from '../utils/dateKey';
import { getFoodSuggestions } from '../utils/foodSuggestions';
import { normalizeFoodSearchText, resolveArabFoodAlias } from '../utils/arabicFoodIntelligence';
import { localizeFoodSuggestions } from '../utils/arabicFoodNames';
import { getDishPhoto } from '../utils/dishPhoto';
import { fetchFoodAutocomplete } from '../apiClient';
import { trackUx } from '../utils/uxAnalytics';
import { mergeAutocompleteSuggestions, rankLocalAutocomplete } from '../utils/foodAutocomplete';
import { addMealItem, buildMealTitle, parseMealTitle, removeMealItem } from '../utils/mealItems';
import { getFoodVisuals, localizeFoodVisualName, type FoodVisual } from '../utils/foodVisuals';
import { useLanguage } from '../i18n';
import { getAvailableMealCategories } from '../utils/phaseAvailability';
import { recognizeFoodImage } from '../utils/localAi';
import { createLatestRequestGuard } from '../utils/latestRequestGuard';
import { mealEditorCopy, mealLabels } from '../utils/mealEditorCopy';
import { shouldClearAutoMatchedMealImage } from '../utils/mealImagePolicy';
import { derivePersonalFrequentLocation } from '../utils/personalFrequentLocation';
import { deriveUsualMealTime } from '../usualMealTime';
import { suggestPersonalMealCompanion } from '../utils/personalMealCompanion';
import { deriveWeekdayMealShortcut } from '../weekdayMealShortcut';
import { acceptPhotoRecognition, createPhotoRecognitionState, resolveConfirmedMealInput, type PhotoRecognitionState } from '../utils/photoRecognitionConfirmation';
import { findRememberedMealCorrection, loadPersonalMealVocabulary, rememberMealCorrection, savePersonalMealVocabulary, type PersonalMealVocabularyEntry } from '../personalMealVocabulary';

interface AddMomentModalProps { isOpen:boolean; onClose:()=>void; onBack?:()=>void; onSave:(momentData:Omit<FoodMoment,'id'|'createdAt'>)=>void; editingMoment?:FoodMoment|null; initialCategory?:MomentCategory|null; initialText?:string; initialItems?:string[]; initialNotes?:string; initialVoiceTranscript?:string; clarificationQuestion?:string; voiceUnderstandingFailed?:boolean; completedMealCategories?:Set<MomentCategory>; moments?:FoodMoment[]; }
const extraMomentCategories:MomentCategory[]=['snack','coffee','dessert'];
const mainMealCategories:MomentCategory[]=['breakfast','lunch','dinner'];
const FOCUSABLE_SELECTOR='button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
export const getMealEditorFocusDestination=(shiftKey:boolean,activeInside:boolean,activeIsFirst:boolean,activeIsLast:boolean):'first'|'last'|null=>{
  if(!activeInside)return shiftKey?'last':'first';
  if(shiftKey&&activeIsFirst)return'last';
  if(!shiftKey&&activeIsLast)return'first';
  return null;
};
export const AddMomentModal:React.FC<AddMomentModalProps>=({isOpen,onClose,onBack,onSave,editingMoment,initialCategory,initialText='',initialItems=[],initialNotes='',initialVoiceTranscript='',clarificationQuestion='',voiceUnderstandingFailed=false,completedMealCategories=new Set(),moments=[]})=>{
  const {language}=useLanguage(); const ar=language==='ar'; const labels=mealLabels[language]; const copy=mealEditorCopy[language]; const hour=new Date().getHours();
  const [showMainMeals,setShowMainMeals]=React.useState(false);
  const availableMainMeals=getAvailableMealCategories(hour,mainMealCategories).filter(item=>!completedMealCategories.has(item));
  const visibleCategories=editingMoment?[editingMoment.category]:initialCategory?[initialCategory]:[...extraMomentCategories,...(showMainMeals?availableMainMeals:[])];
  const [category,setCategory]=React.useState<MomentCategory>('lunch');
  const [chosenLocation,setChosenLocation]=React.useState<string|null>(null);
  const [chosenTime,setChosenTime]=React.useState<string|null>(null);
  const [storedHistory,setStoredHistory]=React.useState<FoodMoment[]>([]);
  const [personalVocabulary,setPersonalVocabulary]=React.useState<PersonalMealVocabularyEntry[]>([]);
  const locationSuggestion=React.useMemo(()=>editingMoment?null:derivePersonalFrequentLocation(moments.length?moments:storedHistory,category),[moments,storedHistory,category,editingMoment]);
  const usualTime=React.useMemo(()=>editingMoment?null:deriveUsualMealTime(moments.length?moments:storedHistory,category),[moments,storedHistory,category,editingMoment]);
  const locationCopy={
    en:{label:'Your usual place for this meal',use:'Use this place',selected:'Place selected'},
    de:{label:'Dein häufiger Ort für diese Mahlzeit',use:'Diesen Ort übernehmen',selected:'Ort übernommen'},
    fr:{label:'Ton lieu habituel pour ce repas',use:'Utiliser ce lieu',selected:'Lieu sélectionné'},
    ar:{label:'مكانك المعتاد لهذه الوجبة',use:'استخدم هذا المكان',selected:'تم اختيار المكان'},
  }[language];
  const timeCopy={en:{label:'Your usual time for this meal',use:'Use this time',selected:'Time selected'},de:{label:'Deine übliche Zeit für diese Mahlzeit',use:'Diese Uhrzeit übernehmen',selected:'Uhrzeit übernommen'},fr:{label:'Ton heure habituelle pour ce repas',use:'Utiliser cette heure',selected:'Heure sélectionnée'},ar:{label:'وقتك المعتاد لهذه الوجبة',use:'استخدم هذا الوقت',selected:'تم اختيار الوقت'}}[language];
  const [imageUrl,setImageUrl]=React.useState('');
  const [title,setTitle]=React.useState('');
  const [items,setItems]=React.useState<string[]>([]);
  const [notes,setNotes]=React.useState('');
  const [clarificationAnswer,setClarificationAnswer]=React.useState('');
  const [clarificationResolution,setClarificationResolution]=React.useState<'pending'|'answered'|'skipped'>('pending');
  const [showMore,setShowMore]=React.useState(false);
  const [country,setCountry]=React.useState<string|null>(null);
  const [aiSuggestions,setAiSuggestions]=React.useState<string[]>([]);
  const [aiLoading,setAiLoading]=React.useState(false);
  const [focused,setFocused]=React.useState(false);
  const [imageAnalyzing,setImageAnalyzing]=React.useState(false);
  const [imageReading,setImageReading]=React.useState(false);
  const [imageRecognitionNote,setImageRecognitionNote]=React.useState('');
  const [photoRecognition,setPhotoRecognition]=React.useState<PhotoRecognitionState>(()=>createPhotoRecognitionState([]));
  const fileRef=React.useRef<HTMLInputElement>(null);
  const overlayRef=React.useRef<HTMLDivElement>(null);
  const dialogRef=React.useRef<HTMLDivElement>(null);
  const closeButtonRef=React.useRef<HTMLButtonElement>(null);
  const openerRef=React.useRef<HTMLElement|null>(null);
  const restoreOpenerRef=React.useRef(true);
  const focusRestoreFrameRef=React.useRef<number|null>(null);
  const requestId=React.useRef(0);
  const imageReadId=React.useRef(0);
  // Each capture session owns its pending photo result. A later session must
  // never accept results from a canceled upload or a previous meal category.
  const photoAnalysisGuard=React.useRef(createLatestRequestGuard());
  const invalidatePhotoAnalysis=()=>{
    photoAnalysisGuard.current.invalidate();
    imageReadId.current+=1;
    setImageAnalyzing(false);
    setImageReading(false);
    setImageRecognitionNote('');
    setPhotoRecognition(createPhotoRecognitionState([]));
  };
  const closeEditor=()=>{invalidatePhotoAnalysis();onClose()};
  const backEditor=()=>{restoreOpenerRef.current=false;invalidatePhotoAnalysis();onBack?.()};

  const companionCopy={
    en:{label:'Often together in your meals',help:'Nothing is added until you choose it.',use:(item:string)=>`Add ${item}`},
    de:{label:'Oft zusammen in deinen Mahlzeiten',help:'Nichts wird hinzugefügt, bis du es auswählst.',use:(item:string)=>`${item} hinzufügen`},
    fr:{label:'Souvent ensemble dans tes repas',help:'Rien n’est ajouté avant que tu le choisisses.',use:(item:string)=>`Ajouter ${item}`},
    ar:{label:'غالباً معاً في وجباتك',help:'لن تتم إضافة أي شيء حتى تختاره.',use:(item:string)=>`أضف ${item}`},
  }[language];
  const weekdayCopy={
    en:{label:'Your usual meal for this weekday',help:'Nothing is added or saved until you choose it.',use:(item:string)=>`Use ${item}`},
    de:{label:'Deine übliche Mahlzeit für diesen Wochentag',help:'Nichts wird hinzugefügt oder gespeichert, bis du es auswählst.',use:(item:string)=>`${item} übernehmen`},
    fr:{label:'Ton repas habituel pour ce jour',help:'Rien n’est ajouté ni enregistré avant ton choix.',use:(item:string)=>`Utiliser ${item}`},
    ar:{label:'وجبتك المعتادة لهذا اليوم من الأسبوع',help:'لن تتم إضافة أو حفظ أي شيء حتى تختاره.',use:(item:string)=>`استخدم ${item}`},
  }[language];
  const vocabularyCopy={
    en:{label:'Your remembered wording',help:'Nothing is changed or saved until you choose and confirm it.',use:(item:string)=>`Use ${item}`},
    de:{label:'Deine gemerkte Formulierung',help:'Nichts wird geändert oder gespeichert, bis du sie auswählst und bestätigst.',use:(item:string)=>`${item} übernehmen`},
    fr:{label:'Ta formulation mémorisée',help:'Rien n’est modifié ni enregistré avant ton choix et ta confirmation.',use:(item:string)=>`Utiliser ${item}`},
    ar:{label:'تسميتك المحفوظة',help:'لن يتم تغيير أو حفظ أي شيء حتى تختارها وتؤكدها.',use:(item:string)=>`استخدم ${item}`},
  }[language];
  const weekdaySuggestion=React.useMemo(()=>{
    if(editingMoment||items.length>0||title.trim())return null;
    return deriveWeekdayMealShortcut(moments.length?moments:storedHistory,getLocalDateKey(new Date()),category);
  },[editingMoment,items.length,title,moments,storedHistory,category]);

  const companionSuggestion=React.useMemo(()=>{
    if(editingMoment||items.length===0)return null;
    const history=(moments.length?moments:storedHistory).map(moment=>({
      items:parseMealTitle(moment.title),
      isDemo:(moment.tags??[]).some(tag=>['demo','seed','sample'].includes(tag.toLocaleLowerCase())),
      createdAt:moment.createdAt,
    }));
    const suggestion=suggestPersonalMealCompanion(items[items.length-1],history);
    if(!suggestion)return null;
    const key=normalizeFoodSearchText(suggestion);
    return items.some(item=>normalizeFoodSearchText(item)===key)?null:suggestion;
  },[editingMoment,items,moments,storedHistory]);

  React.useEffect(()=>{photoAnalysisGuard.current.invalidate();setImageAnalyzing(false);if(!isOpen){imageReadId.current+=1;setImageReading(false);setPhotoRecognition(createPhotoRecognitionState([]));setImageRecognitionNote('');return;}imageReadId.current+=1;setImageReading(false);setShowMainMeals(false);setClarificationAnswer('');setPhotoRecognition(createPhotoRecognitionState([]));setChosenLocation(null);setChosenTime(null);setPersonalVocabulary(loadPersonalMealVocabulary(localStorage));try{const stored=JSON.parse(localStorage.getItem('nimmapp_moments_v1')||'[]');setStoredHistory(Array.isArray(stored)?stored:[])}catch{setStoredHistory([])}setCountry(null);fetch('/api/locale',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>setCountry(data?.country?String(data.country).toUpperCase():null)).catch(()=>setCountry(null));if(editingMoment){setCategory(editingMoment.category);setImageUrl(editingMoment.imageUrl);setTitle('');setItems(parseMealTitle(editingMoment.title));setNotes(editingMoment.notes||'');setShowMore(Boolean(editingMoment.notes));return;}const suggested=initialCategory||'snack';const next=(initialCategory?[initialCategory]:extraMomentCategories).includes(suggested)?suggested:'snack';setCategory(next);setImageUrl('');setTitle(initialText);setFocused(Boolean(initialText));setItems(initialItems);setNotes(initialNotes);setShowMore(Boolean(initialNotes));setAiSuggestions([]);setImageRecognitionNote('')},[isOpen,editingMoment,initialCategory,initialText,initialItems,initialNotes]);
  React.useEffect(()=>{if(isOpen)setClarificationResolution('pending')},[isOpen,clarificationQuestion]);
  React.useEffect(()=>{
    if(!isOpen)return;
    if(focusRestoreFrameRef.current!==null){cancelAnimationFrame(focusRestoreFrameRef.current);focusRestoreFrameRef.current=null}
    openerRef.current=document.activeElement instanceof HTMLElement?document.activeElement:null;
    restoreOpenerRef.current=true;
    closeButtonRef.current?.focus();
    const overlay=overlayRef.current;
    const siblings=overlay?.parentElement?Array.from(overlay.parentElement.children).filter(element=>element!==overlay&&element instanceof HTMLElement) as HTMLElement[]:[];
    const previous=siblings.map(element=>({element,inert:element.inert,ariaHidden:element.getAttribute('aria-hidden')}));
    siblings.forEach(element=>{element.inert=true;element.setAttribute('aria-hidden','true')});
    return()=>{
      previous.forEach(({element,inert,ariaHidden})=>{element.inert=inert;if(ariaHidden===null)element.removeAttribute('aria-hidden');else element.setAttribute('aria-hidden',ariaHidden)});
      if(!restoreOpenerRef.current)return;
      const opener=openerRef.current;
      // React can run this cleanup before removing the detail dialog that
      // contained the original Edit button. Restore after the commit so a
      // disconnected opener falls back to the visible capture control.
      focusRestoreFrameRef.current=requestAnimationFrame(()=>{
        focusRestoreFrameRef.current=null;
        if(opener?.isConnected&&opener.offsetParent!==null&&!opener.closest('[inert], [aria-hidden="true"]')){opener.focus();return;}
        const candidates=Array.from(document.querySelectorAll<HTMLElement>('[data-testid="desktop-capture-button"], [data-testid="primary-capture-button"]'));
        candidates.find(element=>element.offsetParent!==null&&!element.closest('[inert], [aria-hidden="true"]'))?.focus();
      });
    };
  },[isOpen]);
  React.useEffect(()=>{photoAnalysisGuard.current.invalidate();setImageAnalyzing(false);setPhotoRecognition(createPhotoRecognitionState([]));setImageRecognitionNote('')},[language]);

  const all=React.useMemo(()=>getFoodSuggestions(country,title.trim()?undefined:category),[country,category,title]);
  const localizedAll=React.useMemo(()=>localizeFoodSuggestions(all,language),[all,language]);
  const aliasMatch=React.useMemo(()=>{const alias=resolveArabFoodAlias(title,country);return alias?(language==='ar'?alias.canonicalAr:alias.canonicalEn):null},[title,country,language]);
  const rememberedCorrection=React.useMemo(()=>findRememberedMealCorrection(personalVocabulary,title),[personalVocabulary,title]);
  const localMatches=React.useMemo(()=>{const ranked=rankLocalAutocomplete(localizedAll.map(x=>x.name),title,6);return aliasMatch&&title.trim()?[aliasMatch,...ranked.filter(name=>normalizeFoodSearchText(name)!==normalizeFoodSearchText(aliasMatch))].slice(0,6):ranked},[localizedAll,title,aliasMatch]);
  const safeAiSuggestions=React.useMemo(()=>ar?aiSuggestions.filter(name=>/[\u0600-\u06FF]/.test(name)&&!/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(name)):aiSuggestions,[aiSuggestions,ar]);
  const mergedSuggestions=React.useMemo(()=>mergeAutocompleteSuggestions(localMatches,safeAiSuggestions,title,6),[localMatches,safeAiSuggestions,title]);
  const photoName=title.trim() || (items.length===1?items[0]:'');
  const matchedPhoto=React.useMemo(()=>photoName?getDishPhoto(photoName,category):null,[photoName,category]);
  const visualMatches=React.useMemo(()=>getFoodVisuals(category,title,12),[category,title]);
  const photoConfirmationPending=photoRecognition.suggestions.length>0&&!photoRecognition.accepted&&!title.trim()&&items.length===0;
  const photoSuggestionTitle=language==='ar'?'اقتراحات من الصورة':language==='de'?'Vorschläge aus dem Foto':language==='fr'?'Suggestions de la photo':'Photo suggestions';
  const photoUseLabel=language==='ar'?'استخدم':language==='de'?'Übernehmen':language==='fr'?'Utiliser':'Use';
  const photoSelectedLabel=language==='ar'?'مختار':language==='de'?'Ausgewählt':language==='fr'?'Sélectionné':'Selected';
  const photoEditLabel=language==='ar'?'تعديل':language==='de'?'Bearbeiten':language==='fr'?'Modifier':'Edit';
  const photoConfirmationHelp=language==='ar'?'اختر اقتراحاً أو اكتب الوجبة بنفسك قبل الحفظ.':language==='de'?'Wähle einen Vorschlag aus oder gib die Mahlzeit selbst ein, bevor du speicherst.':language==='fr'?'Choisis une suggestion ou saisis toi-même le repas avant d’enregistrer.':'Choose a suggestion or type the meal yourself before saving.';

  React.useEffect(()=>{if(!isOpen||title.trim().length<2){setAiSuggestions([]);setAiLoading(false);return;}const q=title.trim();const id=++requestId.current;const timer=setTimeout(async()=>{setAiLoading(true);const results=await fetchFoodAutocomplete({query:q,category,language,country});if(id!==requestId.current)return;const safe=language==='ar'?results.filter(name=>/[\u0600-\u06FF]/.test(name)&&!/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(name)):results;setAiSuggestions(safe);setAiLoading(false);if(safe.length)trackUx({eventName:'autocomplete_returned',surface:'meal_editor',language,metadata:{source:'ai',count:safe.length,category}})},450);return()=>clearTimeout(timer)},[title,category,language,country,isOpen]);

  const chooseCategory=(next:MomentCategory)=>{invalidatePhotoAnalysis();setCategory(next);setChosenLocation(null);setChosenTime(null);setTitle('');setItems([]);setPhotoRecognition(createPhotoRecognitionState([]));if(!editingMoment)setImageUrl('');setAiSuggestions([])};
  const addItem=(name:string,source:'local'|'ai'|'typed')=>{const next=addMealItem(items,name);if(next.length===items.length){setTitle('');setFocused(true);return;}setItems(next);setTitle('');setAiSuggestions([]);setFocused(true);if(next.length===1){const photo=getDishPhoto(name,category);if(photo&&!imageUrl)setImageUrl(photo.url)}else if(shouldClearAutoMatchedMealImage({isEditing:Boolean(editingMoment),currentImageUrl:imageUrl,matchedImageUrl:matchedPhoto?.url}))setImageUrl('');trackUx({eventName:source==='typed'?'autocomplete_confirmed':'autocomplete_selected',surface:'meal_editor',language,metadata:{source,category,count:next.length}})};
  const chooseDish=(name:string,source:'local'|'ai'='local')=>addItem(name,source);
  const chooseVisual=(visual:FoodVisual)=>{const name=localizeFoodVisualName(visual,language);const next=addMealItem(items,name);setItems(next);setTitle('');setFocused(false);setAiSuggestions([]);setImageUrl(visual.imageUrl);trackUx({eventName:'food_image_selected',surface:'meal_editor',language,metadata:{source:'image_matrix',category,count:next.length}})};
  const changeTitle=(value:string)=>{setTitle(value);setFocused(true);if(items.length===0){const photo=getDishPhoto(value,category);if(photo&&!editingMoment)setImageUrl(photo.url);else if(shouldClearAutoMatchedMealImage({isEditing:Boolean(editingMoment),currentImageUrl:imageUrl,matchedImageUrl:matchedPhoto?.url}))setImageUrl('')}};
  const confirmTitle=()=>{if(!title.trim())return;addItem(title,'typed')};
  const confirmClarification=()=>{const answer=clarificationAnswer.trim();if(!answer)return;setItems(current=>addMealItem(current,answer));setClarificationAnswer('');setClarificationResolution('answered');trackUx({eventName:'autocomplete_confirmed',surface:'meal_editor',language,metadata:{source:'clarification',category}})};
  const skipClarification=()=>{setClarificationAnswer('');setClarificationResolution('skipped');trackUx({eventName:'autocomplete_confirmed',surface:'meal_editor',language,metadata:{source:'clarification_skipped',category}})};
  const handleKeyDown=(e:React.KeyboardEvent<HTMLInputElement>)=>{if(e.key==='Enter'){e.preventDefault();confirmTitle()}else if(e.key==='Escape'&&focused&&Boolean(title.trim())){e.preventDefault();e.stopPropagation();setFocused(false)}};
  const handleDialogKeyDown=(event:React.KeyboardEvent<HTMLDivElement>)=>{
    if(event.key==='Escape'){event.preventDefault();closeEditor();return;}
    if(event.key!=='Tab')return;
    const focusable:HTMLElement[]=dialogRef.current?Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)):[];
    if(!focusable.length){event.preventDefault();dialogRef.current?.focus();return;}
    const active=document.activeElement;
    const destination=getMealEditorFocusDestination(event.shiftKey,Boolean(active&&dialogRef.current?.contains(active)),active===focusable[0],active===focusable[focusable.length-1]);
    if(destination){event.preventDefault();(destination==='first'?focusable[0]:focusable[focusable.length-1]).focus()}
  };
  const acceptPhotoSuggestion=(name:string)=>setPhotoRecognition(current=>acceptPhotoRecognition(current,name));
  const editPhotoSuggestion=(name:string)=>{setPhotoRecognition(current=>acceptPhotoRecognition(current,name));setTitle(name);setFocused(true)};
  const handleUpload=async(event:React.ChangeEvent<HTMLInputElement>)=>{const file=event.target.files?.[0];if(!file)return;const analysisToken=photoAnalysisGuard.current.start();setPhotoRecognition(createPhotoRecognitionState([]));const readId=++imageReadId.current;setImageReading(true);const reader=new FileReader();reader.onload=()=>{if(readId!==imageReadId.current)return;if(typeof reader.result==='string')setImageUrl(reader.result);setImageReading(false)};reader.onerror=()=>{if(readId!==imageReadId.current)return;setImageReading(false);setImageRecognitionNote(copy.photoUnavailable)};reader.readAsDataURL(file);setImageAnalyzing(true);setImageRecognitionNote(copy.photoAnalyzingNote);try{const results=await recognizeFoodImage(file);if(!photoAnalysisGuard.current.isCurrent(analysisToken))return;const foodAr:Record<string,string>={'boiled eggs':'بيض مسلوق','fried eggs':'بيض مقلي','omelette':'أومليت','eggs with tomato':'بيض ومطيشة','chicken tagine':'طاجين دجاج','beef tagine with prunes':'طاجين اللحم بالبرقوق','vegetable couscous':'كسكس بالخضر','meat couscous':'كسكس باللحم','harira soup':'حريرة','msemen flatbread':'مسمن','baghrir pancakes':'بغرير','rfissa':'رفيسة','pastilla':'بسطيلة','bissara soup':'بيصارة','zaalouk':'زعلوك','taktouka':'تكتوكة','grilled sardines':'سردين مشوي','kefta':'كفتة','bread with olive oil':'خبز وزيت الزيتون','mint tea':'أتاي بالنعناع','coffee with milk':'قهوة بالحليب','salad':'سلطة','pasta':'باستا','rice dish':'أرز','sandwich':'ساندويتش','pizza':'بيتزا','fruit':'فواكه','yogurt':'زبادي','dessert':'حلويات'};const strong=results.filter(r=>r.score>=0.12);const names=strong.map(r=>ar?(foodAr[r.label]||r.label):r.label);if(names.length){setPhotoRecognition(createPhotoRecognitionState(names.slice(0,4)));setImageRecognitionNote(copy.photoSuggestion)}else{setPhotoRecognition(createPhotoRecognitionState([]));setImageRecognitionNote(copy.photoLowConfidence)}}catch{if(photoAnalysisGuard.current.isCurrent(analysisToken)){setPhotoRecognition(createPhotoRecognitionState([]));setImageRecognitionNote(copy.photoUnavailable)}}finally{if(photoAnalysisGuard.current.isCurrent(analysisToken))setImageAnalyzing(false)}};

  const save=()=>{if(imageReading||photoConfirmationPending)return;const now=new Date();const confirmed=resolveConfirmedMealInput({typedTitle:title,items,photoRecognition});const mealTitle=buildMealTitle(confirmed.items,confirmed.title)||labels[category];if(editingMoment){const nextVocabulary=rememberMealCorrection(personalVocabulary,editingMoment.title,mealTitle,now.toISOString());if(nextVocabulary!==personalVocabulary&&savePersonalMealVocabulary(localStorage,nextVocabulary))setPersonalVocabulary(nextVocabulary)}const defaultTime={time:editingMoment ? editingMoment.time : now.toTimeString().slice(0,5)}.time;onSave({title:mealTitle,label:labels[category],category,date:editingMoment?.date||getLocalDateKey(now),time:editingMoment ? defaultTime : chosenTime||defaultTime,location:editingMoment?.location||chosenLocation||copy.defaultLocation,locationCategory:editingMoment?.locationCategory||'home',imageUrl,rating:editingMoment?.rating||5,mood:editingMoment?.mood||'satisfied',hungerLevel:editingMoment?.hungerLevel,fullnessLevel:editingMoment?.fullnessLevel,eatingPace:editingMoment?.eatingPace,distraction:editingMoment?.distraction,energyAfter:editingMoment?.energyAfter,coachFeedback:editingMoment?.coachFeedback,notes:notes.trim()||undefined,tags:editingMoment?.tags||[],isFavorite:editingMoment?.isFavorite||false,nutrition:editingMoment?.nutrition||{},price:editingMoment?.price,companions:editingMoment?.companions});closeEditor()};
  if(!isOpen)return null;

  return <div ref={overlayRef} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-sm sm:p-4"><div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="meal-editor-title" tabIndex={-1} onKeyDown={handleDialogKeyDown} className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-[34px] sm:rounded-[34px] bg-[#F7F5F0] shadow-2xl">
    <div className="sticky top-0 z-10 flex items-center justify-between bg-[#F7F5F0]/95 px-5 pt-5 pb-3 backdrop-blur-xl"><div className="flex items-center gap-3">{onBack&&<button type="button" onClick={backEditor} className="grid h-10 w-10 place-items-center rounded-full bg-white border border-[#E5E0D7]" aria-label={copy.back}><ArrowLeft className={`h-4 w-4 ${ar?'rotate-180':''}`}/></button>}<div><p className="text-[11px] font-extrabold uppercase tracking-[.18em] text-[#8A867E]">{copy.food}</p><h2 id="meal-editor-title" className="mt-1 text-2xl font-display font-black text-[#252824]">{copy.title}</h2></div></div><button ref={closeButtonRef} type="button" onClick={closeEditor} className="grid h-10 w-10 place-items-center rounded-full bg-white border border-[#E5E0D7]" aria-label={copy.close}><X className="h-5 w-5"/></button></div>
    <div className="px-5 pb-6">
      {!editingMoment&&!initialCategory&&<div className="mb-3 rounded-[20px] border border-[#E4DDD2] bg-[#FFFDF9] px-4 py-3"><p className="text-xs font-black text-[#4A4C46]">{copy.extraTitle}</p><p className="mt-1 text-[11px] text-[#817C73]">{copy.extraHelp}</p></div>}
      {initialVoiceTranscript&&<div data-testid="voice-understanding-card" className="mb-4 rounded-[20px] border border-[#DED7CC] bg-white px-4 py-4"><p className="text-[11px] font-black uppercase tracking-[.12em] text-[#8A867E]">{copy.voiceMessage}</p><p className="mt-2 text-sm font-semibold text-[#343631]">{initialVoiceTranscript}</p>{voiceUnderstandingFailed?<div className="mt-3 rounded-[14px] bg-[#FFF4E8] px-3 py-2 text-xs font-bold text-[#8A5A2B]">{copy.voiceFailed}</div>:<div className="mt-3 rounded-[14px] bg-[#EEF5EA] px-3 py-2 text-xs font-bold text-[#526B48]">{copy.voiceUnderstood}</div>}</div>}
      {clarificationQuestion&&<div data-testid="meal-clarification-card" className={`mb-4 rounded-[20px] border border-[#C9D7BE] bg-[#F1F6ED] ${clarificationResolution==='pending'?'px-4 py-4':'px-3 py-2.5'}`}><div className={`flex gap-3 ${clarificationResolution==='pending'?'items-start':'items-center'}`}><span className={`${clarificationResolution==='pending'?'mt-0.5 h-8 w-8':'h-7 w-7'} grid shrink-0 place-items-center rounded-full bg-[#526B48] text-white`}>{clarificationResolution!=='pending'?<Check className="h-4 w-4"/>:<Sparkles className="h-4 w-4"/>}</span><div className="min-w-0 flex-1"><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#6C7F60]">{clarificationResolution==='answered'?(language==='ar'?'تمت إضافة التفصيل':language==='de'?'Ergänzung übernommen':language==='fr'?'Précision ajoutée':'Detail added'):clarificationResolution==='skipped'?(language==='ar'?'بدون تفاصيل إضافية':language==='de'?'Ohne weitere Angabe':language==='fr'?'Sans autre précision':'No extra detail'):(language==='ar'?'تفصيل واحد فقط':language==='de'?'Nur eine kurze Ergänzung':language==='fr'?'Une petite précision':'One quick detail')}</p>{clarificationResolution==='pending'&&<p id="meal-clarification-question" className="mt-1 text-sm font-bold leading-5 text-[#343631]" dir="auto">{clarificationQuestion}</p>}</div>{clarificationResolution!=='pending'&&<button type="button" data-testid="meal-clarification-save" onClick={save} disabled={imageReading||photoConfirmationPending} className="shrink-0 rounded-full bg-[#526B48] px-3 py-2 text-[11px] font-extrabold text-white disabled:opacity-40">{language==='ar'?'حفظ الآن':language==='de'?'Jetzt speichern':language==='fr'?'Enregistrer':'Save now'}</button>}</div>{clarificationResolution==='pending'&&<><div className="mt-3 flex gap-2"><input data-testid="meal-clarification-answer" aria-describedby="meal-clarification-question" value={clarificationAnswer} onChange={event=>setClarificationAnswer(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();confirmClarification()}}} placeholder={language==='ar'?'اكتب الجواب باختصار…':language==='de'?'Kurz antworten…':language==='fr'?'Répondre brièvement…':'Answer briefly…'} className="min-w-0 flex-1 rounded-full border border-[#C9D7BE] bg-white px-4 py-2.5 text-sm font-semibold outline-none"/><button type="button" onClick={confirmClarification} disabled={!clarificationAnswer.trim()} aria-label={language==='ar'?'إضافة الجواب':language==='de'?'Antwort hinzufügen':language==='fr'?'Ajouter la réponse':'Add answer'} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#526B48] text-white disabled:opacity-35"><Check className="h-4 w-4"/></button></div><button type="button" data-testid="meal-clarification-skip" onClick={skipClarification} className="mt-2 text-xs font-bold text-[#6C7F60] underline decoration-[#9EB191] underline-offset-4">{language==='ar'?'لا أعرف — تابع بدونها':language==='de'?'Nicht sicher — ohne Angabe fortfahren':language==='fr'?'Je ne sais pas — continuer sans précision':'Not sure — continue without it'}</button></>}</div>}
      <div className="flex gap-2 overflow-x-auto pb-2">{visibleCategories.map(item=><button key={item} onClick={()=>chooseCategory(item)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-extrabold ${item===category?'bg-[#252824] text-white':'bg-white border border-[#E5E0D7] text-[#66655F]'}`}>{labels[item]}</button>)}</div>
      {!editingMoment&&!initialCategory&&availableMainMeals.length>0&&<button type="button" data-testid="show-other-meal-categories" onClick={()=>setShowMainMeals(v=>!v)} className="mt-1 text-[11px] font-black text-[#526B48]">{showMainMeals?copy.hideMain:copy.anotherMeal}</button>}

      {locationSuggestion&&<section data-testid="frequent-location-suggestion" className="mt-3 rounded-[18px] border border-[#D8E2D0] bg-[#F3F7F0] px-4 py-3">
        <p className="text-xs font-bold text-[#526B48]">{locationCopy.label}</p>
        <p data-testid="frequent-location-name" dir="auto" className="mt-1 text-sm font-semibold text-[#343631]">{locationSuggestion.location}</p>
        <button type="button" data-testid="use-frequent-location" aria-pressed={chosenLocation===locationSuggestion.location} onClick={()=>setChosenLocation(locationSuggestion.location)} className="mt-2 rounded-full bg-[#526B48] px-3 py-2 text-xs font-bold text-white">{chosenLocation===locationSuggestion.location?locationCopy.selected:locationCopy.use}</button>
      </section>}

      {weekdaySuggestion&&<section data-testid="weekday-meal-shortcut" className="mt-3 rounded-[18px] border border-[#D8E2D0] bg-[#F3F7F0] px-4 py-3">
        <p className="text-xs font-bold text-[#526B48]">{weekdayCopy.label}</p>
        <p className="mt-1 text-[11px] text-[#6C7F60]">{weekdayCopy.help}</p>
        <button type="button" data-testid="use-weekday-meal-shortcut" onClick={()=>setItems(parseMealTitle(weekdaySuggestion.title))} className="mt-2 rounded-full bg-[#526B48] px-3 py-2 text-xs font-bold text-white" dir="auto">{weekdayCopy.use(weekdaySuggestion.title)}</button>
      </section>}

      {usualTime&&<section data-testid="usual-meal-time-suggestion" className="mt-3 rounded-[18px] border border-[#D8E2D0] bg-[#F3F7F0] px-4 py-3">
        <p className="text-xs font-bold text-[#526B48]">{timeCopy.label}</p>
        <p data-testid="usual-meal-time-value" className="mt-1 text-sm font-semibold text-[#343631]">{usualTime}</p>
        <button type="button" data-testid="use-usual-meal-time" aria-pressed={chosenTime===usualTime} onClick={()=>setChosenTime(usualTime)} className="mt-2 rounded-full bg-[#526B48] px-3 py-2 text-xs font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252824]">{chosenTime===usualTime?timeCopy.selected:timeCopy.use}</button>
      </section>}

      <div className="mt-4 relative">
        <Search className={`absolute z-10 ${ar?'right-4':'left-4'} top-[26px] -translate-y-1/2 w-4 h-4 text-[#918D84]`}/>
        <input value={title} onFocus={()=>setFocused(true)} onChange={e=>changeTitle(e.target.value)} onKeyDown={handleKeyDown} placeholder={copy.placeholder} autoComplete="off" className={`w-full rounded-[22px] border ${items.length?'border-[#789267]':'border-[#DED8CF]'} bg-white py-4 ${ar?'pr-11 pl-14 text-right':'pl-11 pr-14'} text-[15px] font-semibold outline-none transition`}/>
        <button type="button" onClick={confirmTitle} disabled={!title.trim()} aria-label={copy.confirm} className={`absolute ${ar?'left-2':'right-2'} top-2 w-10 h-10 rounded-full grid place-items-center transition ${title.trim()?'bg-[#526B48] text-white':'bg-[#EEF1E8] text-[#526B48] disabled:opacity-35'}`}><Check className="w-5 h-5"/></button>

        {focused&&title.trim()&&<div className="absolute z-30 mt-2 w-full overflow-hidden rounded-[22px] border border-[#E4DDD2] bg-[#FFFDF9] shadow-[0_18px_45px_rgba(48,38,28,.16)]">
          <div className="px-4 pt-3 pb-2 flex items-center justify-between"><span className="text-[10px] font-black text-[#8A867E]">{copy.smartSuggestions}</span>{aiLoading&&<span className="flex items-center gap-1 text-[10px] font-bold text-[#6C7F60]"><Sparkles className="w-3 h-3 animate-pulse"/>{copy.thinking}</span>}</div>
          {(rememberedCorrection||aliasMatch||mergedSuggestions.length>0)?<div className="pb-2">{rememberedCorrection&&<button type="button" data-testid="remembered-meal-correction" onMouseDown={e=>e.preventDefault()} onClick={()=>{setTitle(rememberedCorrection.preferred);setFocused(true)}} className="w-full px-4 py-3 text-start bg-[#FFF4E8] hover:bg-[#FCE9D6] active:bg-[#F8DFC5]"><span className="block text-[10px] font-black uppercase tracking-[.08em] text-[#9B704A]">{vocabularyCopy.label}</span><span className="mt-1 block text-sm font-black text-[#373933]" dir="auto">{vocabularyCopy.use(rememberedCorrection.preferred)}</span><span className="mt-1 block text-[10px] font-semibold text-[#7C6B5B]">{vocabularyCopy.help}</span></button>}{aliasMatch&&<button type="button" data-testid="recognized-food-alias" onMouseDown={e=>e.preventDefault()} onClick={()=>chooseDish(aliasMatch,'local')} className="w-full px-4 py-3 flex items-center gap-3 text-start bg-[#EEF3E8] hover:bg-[#E7EEE0] active:bg-[#DDE8D5]"><span className="w-8 h-8 rounded-full grid place-items-center shrink-0 bg-[#526B48] text-white"><Check className="w-4 h-4"/></span><span className="flex-1"><span className="block text-sm font-black text-[#373933]">{aliasMatch}</span><span className="block text-[10px] font-bold text-[#6C7F60]">{copy.recognized}</span></span><span className="text-[#6C7F60]">›</span></button>}{mergedSuggestions.filter(name=>!aliasMatch||normalizeFoodSearchText(name)!==normalizeFoodSearchText(aliasMatch)).map(name=>{const ai=safeAiSuggestions.includes(name);return <button type="button" key={name} onMouseDown={e=>e.preventDefault()} onClick={()=>chooseDish(name,ai?'ai':'local')} className="w-full px-4 py-3 flex items-center gap-3 text-start hover:bg-[#F3EFE6] active:bg-[#ECE6DA]"><span className={`w-8 h-8 rounded-full grid place-items-center shrink-0 ${ai?'bg-[#E8EFE1] text-[#526B48]':'bg-[#F3EADF] text-[#9B704A]'}`}>{ai?<Sparkles className="w-4 h-4"/>:<Search className="w-4 h-4"/>}</span><span className="flex-1 text-sm font-bold text-[#373933]">{name}</span><span className="text-[#9A958D]">›</span></button>})}</div>:!aiLoading&&<div className="px-4 pb-4 text-xs text-[#77736B]">{copy.noMatch}</div>}
        </div>}
      </div>

      {items.length>0&&<div className="mt-3 flex flex-wrap gap-2">{items.map((item,index)=><span key={`${item}-${index}`} className="inline-flex max-w-full items-center gap-2 rounded-full bg-[#E8EFE1] px-3 py-2 text-xs font-bold text-[#455744]"><span className="truncate">{item}</span><button type="button" onClick={()=>setItems(removeMealItem(items,index))} aria-label={copy.remove} className="grid h-5 w-5 place-items-center rounded-full bg-white/70 text-[#6A795F]"><X className="h-3 w-3"/></button></span>)}</div>}

      {companionSuggestion&&<section data-testid="personal-meal-companion-suggestion" className="mt-3 rounded-[18px] border border-[#D8E2D0] bg-[#F3F7F0] px-4 py-3">
        <p className="text-xs font-bold text-[#526B48]">{companionCopy.label}</p>
        <p className="mt-1 text-[11px] text-[#6C7F60]">{companionCopy.help}</p>
        <button type="button" onClick={()=>addItem(companionSuggestion,'local')} className="mt-2 rounded-full bg-[#526B48] px-3 py-2 text-xs font-bold text-white" dir="auto">{companionCopy.use(companionSuggestion)}</button>
      </section>}

      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#918D84]"><Globe2 className="w-3.5 h-3.5"/>{items.length?copy.selected(items.length):country?copy.regionPriority:copy.justType}</div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-3"><div><p className="text-xs font-black text-[#4A4C46]">{title.trim()?copy.picturesMatching:copy.chooseByPicture}</p><p className="mt-0.5 text-[10px] text-[#918D84]">{title.trim()?copy.tapPicture:copy.typeToNarrow}</p></div><span className="rounded-full bg-[#E8EFE1] px-2.5 py-1 text-[10px] font-black text-[#526B48]">{visualMatches.length}</span></div>
        {visualMatches.length>0?<div className="grid grid-cols-3 gap-2">{visualMatches.map(visual=>{const visualName=localizeFoodVisualName(visual,language);const selected=items.includes(visualName);return <button type="button" key={visual.id} data-testid={"food-visual-"+visual.id} aria-pressed={selected} onClick={()=>selected?setItems(items.filter(item=>item!==visualName)):chooseVisual(visual)} className={`group relative aspect-square overflow-hidden rounded-[18px] bg-[#EAE4D9] text-start shadow-[0_5px_16px_rgba(55,43,31,.08)] ${selected?'ring-4 ring-[#526B48] ring-offset-2 ring-offset-[#F7F5F0]':''}`}><img src={visual.imageUrl} alt={visualName} loading="lazy" className="h-full w-full object-cover transition duration-200 group-active:scale-[.98]"/>{selected&&<span className="absolute top-2 end-2 grid h-7 w-7 place-items-center rounded-full bg-[#526B48] text-white shadow"><Check className="h-4 w-4"/></span>}<span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-2 pt-6 pb-2 text-[10px] font-black leading-tight text-white">{visualName}</span></button>})}</div>:<div className="rounded-[20px] bg-[#F0ECE4] px-4 py-5 text-center text-xs text-[#77736B]">{copy.noPictures}</div>}
      </div>

      <div className="mt-5"><p className="mb-2 text-xs font-bold text-[#6F6C65]">{copy.photo}</p><div className="grid grid-cols-2 gap-2">{imageUrl&&(!matchedPhoto||imageUrl!==matchedPhoto.url)&&<div className="relative aspect-[4/3] overflow-hidden rounded-[20px] border border-[#E5E0D7]"><img src={imageUrl} alt={copy.yourPhoto} className="w-full h-full object-cover"/><span className="absolute bottom-2 end-2 rounded-full bg-black/55 px-2 py-1 text-[9px] font-bold text-white">{imageAnalyzing?copy.analyzing:copy.yourPhoto}</span></div>}{matchedPhoto&&items.length<=1&&imageUrl===matchedPhoto.url&&<div className="relative aspect-[4/3] overflow-hidden rounded-[20px] border border-[#E5E0D7]"><img src={matchedPhoto.url} alt={title} className="w-full h-full object-cover"/><span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-1 text-[9px] font-bold text-white">{copy.matchedDish}</span></div>}<button onClick={()=>fileRef.current?.click()} disabled={imageAnalyzing||imageReading} className="aspect-[4/3] rounded-[20px] border-2 border-dashed border-[#D8D1C7] bg-white flex flex-col items-center justify-center text-[#77736B] disabled:opacity-60">{imageAnalyzing||imageReading?<LoaderCircle className="w-6 h-6 animate-spin"/>:<Camera className="w-6 h-6"/>}<span className="mt-2 text-[10px] font-bold">{imageAnalyzing||imageReading?copy.analyzingPhoto:copy.addPhoto}</span></button></div>{imageRecognitionNote&&<p className="mt-2 text-[11px] font-semibold text-[#6C7F60]">{imageRecognitionNote}</p>}{photoRecognition.suggestions.length>0&&<div data-testid="photo-recognition-suggestions" className="mt-3 rounded-[18px] border border-[#D8E2D0] bg-[#F3F7F0] p-3"><div className="flex items-center gap-2 text-[11px] font-black text-[#526B48]"><Sparkles className="h-3.5 w-3.5"/>{photoSuggestionTitle}</div><div className="mt-2 space-y-2">{photoRecognition.suggestions.map((name,index)=>{const selected=photoRecognition.accepted===name;return <div key={`${name}-${index}`} className="flex items-center gap-2 rounded-[14px] bg-white px-3 py-2"><span className="min-w-0 flex-1 truncate text-xs font-bold text-[#373933]" dir="auto">{name}</span><button type="button" data-testid={`photo-suggestion-use-${index}`} aria-pressed={selected} onClick={()=>acceptPhotoSuggestion(name)} className={`rounded-full px-3 py-1.5 text-[10px] font-black ${selected?'bg-[#526B48] text-white':'bg-[#E8EFE1] text-[#526B48]'}`}>{selected?photoSelectedLabel:photoUseLabel}</button>{selected&&<button type="button" data-testid={`photo-suggestion-edit-${index}`} onClick={()=>editPhotoSuggestion(name)} className="rounded-full border border-[#C8D5BE] px-3 py-1.5 text-[10px] font-black text-[#526B48]">{photoEditLabel}</button>}</div>})}</div><p className="mt-2 text-[10px] leading-4 text-[#6C7F60]">{photoConfirmationHelp}</p></div>}{(title.trim()||items.length>0)&&!matchedPhoto&&!imageUrl&&<p className="mt-2 text-[11px] text-[#918D84]">{copy.noRandomPhoto}</p>}</div>
      <input ref={fileRef} data-testid="meal-photo-input" type="file" accept="image/*" capture="environment" onChange={handleUpload} className="hidden"/>
      <button onClick={()=>setShowMore(v=>!v)} className="mt-5 flex w-full items-center justify-between rounded-[18px] bg-[#EFE9DE] px-4 py-3 text-sm font-bold text-[#5E5D57]"><span className="flex items-center gap-2"><ImagePlus className="w-4 h-4"/>{copy.addNote}</span><ChevronDown className={`w-4 h-4 ${showMore?'rotate-180':''}`}/></button>
      {showMore&&<textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder={copy.optionalContext} rows={3} className="mt-3 w-full resize-none rounded-[18px] bg-white px-4 py-3 text-sm outline-none border border-[#E1DBD2]"/>}
      <button onClick={save} disabled={imageReading||photoConfirmationPending||(Boolean(clarificationQuestion)&&clarificationResolution==='pending')} aria-describedby={Boolean(clarificationQuestion)&&clarificationResolution==='pending'?'meal-clarification-question':undefined} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#E76F45] px-5 py-4 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40"><Check className="h-5 w-5"/>{editingMoment?copy.saveChanges:copy.saveMeal}</button>
      <p className="mt-2 text-center text-[11px] text-[#99958C]">{copy.footer}</p>
    </div>
  </div></div>
};
