/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { FoodMoment, ActiveTab, DailyCheckIn, TimeOfDayPhase } from './types';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AddMomentModal } from './components/AddMomentModal';
import { MomentDetailModal } from './components/MomentDetailModal';
import { TodayHomeView } from './components/TodayHomeView';
import { DailyCheckInModal } from './components/DailyCheckInModal';
import { CatchUpMiddayCheckInModal } from './components/CatchUpMiddayCheckInModal';
import { NutritionTypeAnalysisView } from './components/NutritionTypeAnalysisView';
import { FoodCalendarView } from './components/FoodCalendarView';
import { CaptureChoiceModal } from './components/CaptureChoiceModal';
import { VoiceCaptureModal } from './components/VoiceCaptureModal';
import { VoiceFirstEntryOverlay } from './components/VoiceFirstEntryOverlay';
import { ProfileIntroModal } from './components/ProfileIntroModal';
import { classifyVoiceIntent, processVoiceCheckIn } from './apiClient';
import { getLocalDateKey } from './utils/dateKey';
import { getDishPhoto } from './utils/dishPhoto';
import { getCheckInMomentCopy } from './utils/checkInMomentLocalization';
import { CHECKIN_SOURCE_TAG, reconcileCheckInMoments } from './utils/checkInMomentState';
import { getCurrentPhase } from './utils/phaseAvailability';
import { trackUx } from './utils/uxAnalytics';
import { buildVoiceJournalEntries } from './utils/voiceJournalApply';
import { mergeVoiceCheckIns, mergeVoiceMoments } from './utils/voiceJournalState';
import { useLanguage } from './i18n';

const STORAGE_KEY='nimmapp_moments_v1';
const STORAGE_KEY_CHECKINS='nimmapp_checkins_v1';
const SEEDED_CHECKIN_IDS=new Set(['checkin-1','checkin-2','checkin-3']);

export default function App(){
  const {language}=useLanguage();
  const [moments,setMoments]=React.useState<FoodMoment[]>(()=>{try{const stored=localStorage.getItem(STORAGE_KEY)||localStorage.getItem('food_journey_moments_v1');if(stored)return JSON.parse(stored);}catch(e){console.error('Failed to load moments from localStorage',e);}return [];});
  const [checkIns,setCheckIns]=React.useState<DailyCheckIn[]>(()=>{try{const stored=localStorage.getItem(STORAGE_KEY_CHECKINS)||localStorage.getItem('getyourcoach_checkins_v1');if(stored)return JSON.parse(stored);}catch(e){console.error('Failed to load check-ins from localStorage',e);}return [];});
  React.useEffect(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(moments));}catch(e){console.error('Failed to save moments',e)}},[moments]);
  React.useEffect(()=>{try{localStorage.setItem(STORAGE_KEY_CHECKINS,JSON.stringify(checkIns));}catch(e){console.error('Failed to save check-ins',e)}},[checkIns]);

  const [activeTab,setActiveTab]=React.useState<ActiveTab>('today');
  const [isCaptureOpen,setIsCaptureOpen]=React.useState(false);
  const [isVoiceCaptureOpen,setIsVoiceCaptureOpen]=React.useState(false);
  const [isProfileOnboardingVoice,setIsProfileOnboardingVoice]=React.useState(false);
  const [isProfileIntroOpen,setIsProfileIntroOpen]=React.useState(false);
  const [profileIntroTranscript,setProfileIntroTranscript]=React.useState('');
  const [isAddModalOpen,setIsAddModalOpen]=React.useState(false);
  const [isCheckInModalOpen,setIsCheckInModalOpen]=React.useState(false);
  const [requestedPhase,setRequestedPhase]=React.useState<TimeOfDayPhase|null>(null);
  const [initialMealCategory,setInitialMealCategory]=React.useState<import('./types').MomentCategory|null>(null);
  const [initialMealText,setInitialMealText]=React.useState('');
  const [initialMealItems,setInitialMealItems]=React.useState<string[]>([]);
  const [initialMealNotes,setInitialMealNotes]=React.useState('');
  const [initialVoiceTranscript,setInitialVoiceTranscript]=React.useState('');
  const [mealClarificationQuestion,setMealClarificationQuestion]=React.useState('');
  const [voiceUnderstandingFailed,setVoiceUnderstandingFailed]=React.useState(false);
  const [addModalHasBack,setAddModalHasBack]=React.useState(false);
  const [isMiddayCatchUpOpen,setIsMiddayCatchUpOpen]=React.useState(false);
  const [editingMoment,setEditingMoment]=React.useState<FoodMoment|null>(null);
  const [selectedMomentDetail,setSelectedMomentDetail]=React.useState<FoodMoment|null>(null);
  const mealStartedAt=React.useRef<number|null>(null);
  const checkinStartedAt=React.useRef<number|null>(null);

  React.useEffect(()=>{trackUx({eventName:'app_opened',surface:'app',language,metadata:{route:'today'}})},[]);
  const completedToday=React.useMemo(()=>{const today=getLocalDateKey();return new Set(checkIns.filter(c=>c.date===today&&!SEEDED_CHECKIN_IDS.has(c.id)).map(c=>c.timeOfDay));},[checkIns]);

  const beginCheckIn=React.useCallback((source='unknown',phase:TimeOfDayPhase|null=null)=>{checkinStartedAt.current=Date.now();setRequestedPhase(phase);trackUx({eventName:'flow_started',surface:'checkin',language,metadata:{source}});if(!phase&&new Date().getHours()>=16&&!completedToday.has('midday')){trackUx({eventName:'catchup_shown',surface:'checkin',language,metadata:{phase:'midday'}});setIsMiddayCatchUpOpen(true);return;}setIsCheckInModalOpen(true);},[completedToday,language]);
  const openFoodCapture=React.useCallback((category:import('./types').MomentCategory|null=null,fromCapture=false,initialText='',initialItems:string[]=[],initialNotes='',voiceTranscript='',understandingFailed=false,clarificationQuestion='')=>{mealStartedAt.current=Date.now();setInitialMealCategory(category);setInitialMealText(initialText);setInitialMealItems(initialItems);setInitialMealNotes(initialNotes);setInitialVoiceTranscript(voiceTranscript);setMealClarificationQuestion(clarificationQuestion);setVoiceUnderstandingFailed(understandingFailed);setAddModalHasBack(fromCapture);trackUx({eventName:'flow_started',surface:'meal_editor',language,metadata:{source:fromCapture?'capture_choice':'direct'}});setEditingMoment(null);setIsAddModalOpen(true);},[language]);
  const openCapture=React.useCallback(()=>{trackUx({eventName:'capture_opened',surface:'capture_choice',language});setIsCaptureOpen(true)},[language]);
  const openVoiceJournal=React.useCallback((source='today_voice')=>{trackUx({eventName:'flow_started',surface:'voice_journal',language,metadata:{source}});setIsCaptureOpen(false);setIsProfileOnboardingVoice(false);setIsVoiceCaptureOpen(true)},[language]);

  const handleSaveMoment=(momentData:Omit<FoodMoment,'id'|'createdAt'>)=>{if(mealStartedAt.current){trackUx({eventName:'flow_finished',surface:'meal_editor',language,durationMs:Date.now()-mealStartedAt.current,outcome:'completed',metadata:{category:momentData.category,has_photo:Boolean(momentData.imageUrl)}});mealStartedAt.current=null;}if(editingMoment){setMoments(prev=>prev.map(m=>m.id===editingMoment.id?{...momentData,id:m.id,createdAt:m.createdAt}:m));setEditingMoment(null);}else setMoments(prev=>[{...momentData,id:`moment-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,createdAt:Date.now()},...prev]);};

  const handleSaveCheckIn=(checkInData:Omit<DailyCheckIn,'id'|'createdAt'>)=>{
    if(checkinStartedAt.current){trackUx({eventName:'flow_finished',surface:'checkin',language,durationMs:Date.now()-checkinStartedAt.current,outcome:'completed',metadata:{phase:checkInData.timeOfDay,has_photo:false}});checkinStartedAt.current=null;}
    const now=Date.now();const newCheckIn:DailyCheckIn={...checkInData,id:`user-checkin-${now}`,createdAt:now};
    const previousCheckIns=checkIns.filter(c=>c.date===checkInData.date&&c.timeOfDay===checkInData.timeOfDay&&!SEEDED_CHECKIN_IDS.has(c.id));
    setCheckIns(prev=>[newCheckIn,...prev.filter(c=>!(c.date===checkInData.date&&c.timeOfDay===checkInData.timeOfDay&&!SEEDED_CHECKIN_IDS.has(c.id)))]);
    if(checkInData.food?.mealTitle){const category=checkInData.food.category;const matchedPhoto=getDishPhoto(checkInData.food.mealTitle,category);const copy=getCheckInMomentCopy(language,category);const newMoment:FoodMoment={id:`moment-${now}`,title:checkInData.food.mealTitle,label:copy.label,category,date:checkInData.date,time:checkInData.time,location:copy.location,locationCategory:'home',imageUrl:matchedPhoto?.url||'',rating:5,mood:checkInData.wellbeing.mood||'satisfied',hungerLevel:checkInData.food.hungerBefore,fullnessLevel:checkInData.food.fullnessAfter,eatingPace:checkInData.food.eatingPace,distraction:checkInData.food.distraction,energyAfter:(checkInData.wellbeing.energyLevel||3)>=4?'energized':'neutral',coachFeedback:{title:copy.captured,message:checkInData.coachSummary||copy.fallbackSummary,type:'praise',badge:copy.badge},notes:checkInData.wellbeing.note,tags:[copy.badge,checkInData.timeOfDay,`${CHECKIN_SOURCE_TAG}${newCheckIn.id}`],createdAt:now};setMoments(prev=>reconcileCheckInMoments(prev,previousCheckIns,checkInData.date,checkInData.timeOfDay,newMoment));}
    else if(previousCheckIns.length)setMoments(prev=>reconcileCheckInMoments(prev,previousCheckIns,checkInData.date,checkInData.timeOfDay));
  };

  const applyVoiceJournal=React.useCallback((result:Awaited<ReturnType<typeof processVoiceCheckIn>>,transcript:string)=>{
    const journal=buildVoiceJournalEntries(result,transcript,language);
    if(journal.moments.length)setMoments(prev=>mergeVoiceMoments(prev,journal.moments));
    if(journal.checkIns.length)setCheckIns(prev=>mergeVoiceCheckIns(prev,journal.checkIns,SEEDED_CHECKIN_IDS));
    if(journal.moments.length||journal.checkIns.length){trackUx({eventName:'flow_finished',surface:'voice_journal',language,outcome:'completed',metadata:{meals:journal.moments.length,checkins:journal.checkIns.length}});return true;}
    return false;
  },[language]);

  const cancelMeal=()=>{setInitialMealCategory(null);setInitialMealText('');setInitialMealItems([]);setInitialMealNotes('');setInitialVoiceTranscript('');setMealClarificationQuestion('');setVoiceUnderstandingFailed(false);setAddModalHasBack(false);if(mealStartedAt.current){trackUx({eventName:'flow_finished',surface:'meal_editor',language,durationMs:Date.now()-mealStartedAt.current,outcome:'cancelled'});mealStartedAt.current=null;}setIsAddModalOpen(false);setEditingMoment(null)};
  const backFromMeal=()=>{setIsAddModalOpen(false);setInitialMealText('');setInitialMealItems([]);setInitialMealNotes('');setInitialVoiceTranscript('');setMealClarificationQuestion('');setVoiceUnderstandingFailed(false);setInitialMealCategory(null);setAddModalHasBack(false);setIsCaptureOpen(true)};
  const cancelCheckin=()=>{setRequestedPhase(null);if(checkinStartedAt.current){trackUx({eventName:'flow_finished',surface:'checkin',language,durationMs:Date.now()-checkinStartedAt.current,outcome:'cancelled'});checkinStartedAt.current=null;}setIsCheckInModalOpen(false);setIsMiddayCatchUpOpen(false)};
  const handleDeleteMoment=(id:string)=>{const moment=moments.find(m=>m.id===id);const sourceCheckInId=moment?.tags.find(tag=>tag.startsWith(CHECKIN_SOURCE_TAG))?.slice(CHECKIN_SOURCE_TAG.length);setMoments(prev=>prev.filter(m=>m.id!==id));if(sourceCheckInId)setCheckIns(prev=>prev.map(checkIn=>checkIn.id===sourceCheckInId?{...checkIn,food:undefined}:checkIn));if(selectedMomentDetail?.id===id)setSelectedMomentDetail(null);};
  const handleToggleFavorite=(id:string)=>{setMoments(prev=>prev.map(m=>m.id===id?{...m,isFavorite:!m.isFavorite}:m));if(selectedMomentDetail?.id===id)setSelectedMomentDetail(prev=>prev?{...prev,isFavorite:!prev.isFavorite}:null);};
  const go=(tab:ActiveTab)=>setActiveTab(tab==='type_analysis'||tab==='timeline'?tab:'today');

  const content=activeTab==='type_analysis'
    ? <NutritionTypeAnalysisView moments={moments} checkIns={checkIns} onOpenCheckIn={openCapture} onOpenAddMoment={openCapture}/>
    : activeTab==='timeline'
      ? <FoodCalendarView moments={moments} onSelectMoment={setSelectedMomentDetail} onOpenAddModal={openCapture}/>
      : <TodayHomeView moments={moments} checkIns={checkIns} onSelectMoment={setSelectedMomentDetail} onOpenAddModal={openCapture} onOpenVoiceJournal={()=>openVoiceJournal('today_home')} onOpenCheckInModal={(phase)=>beginCheckIn('today_phase_card',phase==='evening'&&!completedToday.has('midday')?null:phase)} onOpenSnack={()=>openFoodCapture('snack')} onNavigateToCoach={()=>{}} onNavigateToTypeAnalysis={()=>setActiveTab('type_analysis')} onNavigateToTimeline={()=>setActiveTab('timeline')} onSaveCheckIn={handleSaveCheckIn}/>;

  return <div className="min-h-screen bg-[#F4EEE4] text-stone-900 pb-28 md:pb-0"><VoiceFirstEntryOverlay onStart={()=>{trackUx({eventName:'flow_started',surface:'profile_onboarding',language,metadata:{source:'voice'}});setIsProfileOnboardingVoice(true);setIsVoiceCaptureOpen(true)}} onType={()=>{trackUx({eventName:'flow_started',surface:'profile_onboarding',language,metadata:{source:'type'}});setProfileIntroTranscript('');setIsProfileIntroOpen(true)}}/><Header activeTab={activeTab} setActiveTab={go} onOpenAddModal={openCapture}/><main className={`mx-auto ${activeTab==='today'?'px-0 sm:px-4 lg:px-6 pt-0 sm:pt-5':'px-3 sm:px-4 lg:px-6 py-4 sm:py-6'} max-w-7xl`}>{content}</main><MobileBottomNav activeTab={activeTab} setActiveTab={go} onCapture={openCapture} favoriteCount={0}/><CaptureChoiceModal isOpen={isCaptureOpen} onClose={()=>setIsCaptureOpen(false)} onFood={()=>{trackUx({eventName:'capture_choice_selected',surface:'capture_choice',language,metadata:{step:'food'}});openFoodCapture(null,true)}} onText={()=>openFoodCapture(null,true)} onTellCary={()=>openVoiceJournal('capture_choice')}/><VoiceCaptureModal isOpen={isVoiceCaptureOpen} mode={isProfileOnboardingVoice?'profile':'journal'} onClose={()=>{setIsVoiceCaptureOpen(false);setIsProfileOnboardingVoice(false)}} onBack={()=>{setIsVoiceCaptureOpen(false);if(isProfileOnboardingVoice){setIsProfileOnboardingVoice(false);setProfileIntroTranscript('');setIsProfileIntroOpen(true)}else setIsCaptureOpen(true)}} onTranscript={async(text)=>{setIsVoiceCaptureOpen(false);if(isProfileOnboardingVoice){setIsProfileOnboardingVoice(false);setProfileIntroTranscript(text);setIsProfileIntroOpen(true);return;}const timeOfDay=getCurrentPhase(new Date().getHours());const result=await processVoiceCheckIn(text,timeOfDay,undefined,language);const data=result.extractedData||{};const items=Array.isArray(data.mealItems)?data.mealItems.filter((v):v is string=>typeof v==='string'&&v.trim().length>0):[];const clarification=typeof data.clarificationQuestion==='string'?data.clarificationQuestion.trim():'';const category=(['breakfast','lunch','dinner','snack','coffee','dessert'] as const).includes(data.mealCategory as any)?data.mealCategory as import('./types').MomentCategory:null;if(clarification&&items.length){openFoodCapture(category,true,'',items,data.mealContext||'',text,false,clarification);return;}if(applyVoiceJournal(result,text))return;if(items.length===0){const intent=await classifyVoiceIntent(text,language);if(intent.intent==='profile_goal'&&intent.confidence>=0.65){trackUx({eventName:'flow_started',surface:'profile_onboarding',language,metadata:{source:'voice_intent'}});setProfileIntroTranscript(text);setIsProfileIntroOpen(true);return;}}openFoodCapture(category,true,'',items,data.mealContext||'',text,items.length===0)}}/><ProfileIntroModal isOpen={isProfileIntroOpen} initialTranscript={profileIntroTranscript} onClose={()=>{trackUx({eventName:'flow_finished',surface:'profile_onboarding',language,outcome:'cancelled'});setIsProfileIntroOpen(false);setProfileIntroTranscript('')}} onSaved={()=>{trackUx({eventName:'flow_finished',surface:'profile_onboarding',language,outcome:'completed'});setIsProfileIntroOpen(false);setProfileIntroTranscript('')}}/><AddMomentModal isOpen={isAddModalOpen} onClose={cancelMeal} onBack={addModalHasBack?backFromMeal:undefined} onSave={handleSaveMoment} editingMoment={editingMoment} initialCategory={initialMealCategory} initialText={initialMealText} initialItems={initialMealItems} initialNotes={initialMealNotes} initialVoiceTranscript={initialVoiceTranscript} clarificationQuestion={mealClarificationQuestion} voiceUnderstandingFailed={voiceUnderstandingFailed} completedMealCategories={new Set(Array.from(completedToday).map(p=>p==='morning'?'breakfast':p==='midday'?'lunch':'dinner'))}/><CatchUpMiddayCheckInModal isOpen={isMiddayCatchUpOpen} onClose={cancelCheckin} onSaveCheckIn={handleSaveCheckIn}/><DailyCheckInModal isOpen={isCheckInModalOpen} onClose={cancelCheckin} onSaveCheckIn={handleSaveCheckIn} existingCheckInsCount={checkIns.length} phase={requestedPhase}/><MomentDetailModal moment={selectedMomentDetail} onClose={()=>setSelectedMomentDetail(null)} onEdit={(m)=>{setSelectedMomentDetail(null);setEditingMoment(m);mealStartedAt.current=Date.now();trackUx({eventName:'flow_started',surface:'meal_editor',language,metadata:{source:'edit'}});setIsAddModalOpen(true)}} onDelete={handleDeleteMoment} onToggleFavorite={handleToggleFavorite}/></div>;
}