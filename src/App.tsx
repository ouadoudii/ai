/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { FoodMoment, ActiveTab, DailyCheckIn, TimeOfDayPhase } from './types';
import { INITIAL_FOOD_MOMENTS } from './data/momentsData';
import { INITIAL_DAILY_CHECK_INS } from './data/checkInsData';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AddMomentModal } from './components/AddMomentModal';
import { MomentDetailModal } from './components/MomentDetailModal';
import { TodayHomeView } from './components/TodayHomeView';
import { DailyCheckInModal } from './components/DailyCheckInModal';
import { CatchUpMiddayCheckInModal } from './components/CatchUpMiddayCheckInModal';
import { NutritionTypeAnalysisView } from './components/NutritionTypeAnalysisView';
import { CaptureChoiceModal } from './components/CaptureChoiceModal';
import { getLocalDateKey } from './utils/dateKey';
import { getDishPhoto } from './utils/dishPhoto';
import { trackUx } from './utils/uxAnalytics';
import { useLanguage } from './i18n';

const STORAGE_KEY='nimmapp_moments_v1';
const STORAGE_KEY_CHECKINS='nimmapp_checkins_v1';
const SEEDED_CHECKIN_IDS=new Set(['checkin-1','checkin-2','checkin-3']);
const getEligibleDayparts=(hour:number):TimeOfDayPhase[]=>hour>=5&&hour<11?['morning']:hour>=11&&hour<16?['morning','midday']:['morning','midday','evening'];

export default function App(){
  const {language}=useLanguage();
  const [moments,setMoments]=React.useState<FoodMoment[]>(()=>{try{const stored=localStorage.getItem(STORAGE_KEY)||localStorage.getItem('food_journey_moments_v1');if(stored)return JSON.parse(stored);}catch(e){console.error('Failed to load moments from localStorage',e);}return INITIAL_FOOD_MOMENTS;});
  const [checkIns,setCheckIns]=React.useState<DailyCheckIn[]>(()=>{try{const stored=localStorage.getItem(STORAGE_KEY_CHECKINS)||localStorage.getItem('getyourcoach_checkins_v1');if(stored)return JSON.parse(stored);}catch(e){console.error('Failed to load check-ins from localStorage',e);}return INITIAL_DAILY_CHECK_INS;});
  React.useEffect(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(moments));}catch(e){console.error('Failed to save moments',e)}},[moments]);
  React.useEffect(()=>{try{localStorage.setItem(STORAGE_KEY_CHECKINS,JSON.stringify(checkIns));}catch(e){console.error('Failed to save check-ins',e)}},[checkIns]);

  const [activeTab,setActiveTab]=React.useState<ActiveTab>('today');
  const [isCaptureOpen,setIsCaptureOpen]=React.useState(false);
  const [isAddModalOpen,setIsAddModalOpen]=React.useState(false);
  const [isCheckInModalOpen,setIsCheckInModalOpen]=React.useState(false);
  const [isMiddayCatchUpOpen,setIsMiddayCatchUpOpen]=React.useState(false);
  const [editingMoment,setEditingMoment]=React.useState<FoodMoment|null>(null);
  const [selectedMomentDetail,setSelectedMomentDetail]=React.useState<FoodMoment|null>(null);
  const mealStartedAt=React.useRef<number|null>(null);
  const checkinStartedAt=React.useRef<number|null>(null);

  React.useEffect(()=>{trackUx({eventName:'app_opened',surface:'app',language,metadata:{route:'today'}})},[]);
  const completedToday=React.useMemo(()=>{const today=getLocalDateKey();return new Set(checkIns.filter(c=>c.date===today&&!SEEDED_CHECKIN_IDS.has(c.id)).map(c=>c.timeOfDay));},[checkIns]);

  const beginCheckIn=React.useCallback((source='unknown')=>{checkinStartedAt.current=Date.now();trackUx({eventName:'flow_started',surface:'checkin',language,metadata:{source}});if(new Date().getHours()>=16&&!completedToday.has('midday')){trackUx({eventName:'catchup_shown',surface:'checkin',language,metadata:{phase:'midday'}});setIsMiddayCatchUpOpen(true);return;}setIsCheckInModalOpen(true);},[completedToday,language]);
  const openFoodCapture=React.useCallback(()=>{mealStartedAt.current=Date.now();trackUx({eventName:'flow_started',surface:'meal_editor',language,metadata:{source:'capture_choice'}});setEditingMoment(null);setIsAddModalOpen(true);},[language]);
  const openCapture=React.useCallback(()=>{trackUx({eventName:'capture_opened',surface:'capture_choice',language});setIsCaptureOpen(true)},[language]);

  React.useEffect(()=>{const missing=getEligibleDayparts(new Date().getHours()).some(phase=>!completedToday.has(phase));const launched=sessionStorage.getItem('nimmapp_checkin_auto_opened')==='true';if(!missing||launched)return;sessionStorage.setItem('nimmapp_checkin_auto_opened','true');const timer=setTimeout(()=>{trackUx({eventName:'capture_auto_opened',surface:'capture_choice',language});setIsCaptureOpen(true)},650);return()=>clearTimeout(timer);},[completedToday,language]);

  const handleSaveMoment=(momentData:Omit<FoodMoment,'id'|'createdAt'>)=>{if(mealStartedAt.current){trackUx({eventName:'flow_finished',surface:'meal_editor',language,durationMs:Date.now()-mealStartedAt.current,outcome:'completed',metadata:{category:momentData.category,has_photo:Boolean(momentData.imageUrl)}});mealStartedAt.current=null;}if(editingMoment){setMoments(prev=>prev.map(m=>m.id===editingMoment.id?{...momentData,id:m.id,createdAt:m.createdAt}:m));setEditingMoment(null);}else setMoments(prev=>[{...momentData,id:`moment-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,createdAt:Date.now()},...prev]);};

  const handleSaveCheckIn=(checkInData:Omit<DailyCheckIn,'id'|'createdAt'>)=>{if(checkinStartedAt.current){trackUx({eventName:'flow_finished',surface:'checkin',language,durationMs:Date.now()-checkinStartedAt.current,outcome:'completed',metadata:{phase:checkInData.timeOfDay,has_photo:false}});checkinStartedAt.current=null;}const now=Date.now();const newCheckIn:DailyCheckIn={...checkInData,id:`user-checkin-${now}`,createdAt:now};setCheckIns(prev=>[newCheckIn,...prev.filter(c=>!(c.date===checkInData.date&&c.timeOfDay===checkInData.timeOfDay&&!SEEDED_CHECKIN_IDS.has(c.id)))]);if(checkInData.food?.mealTitle){const category=checkInData.food.category;const matchedPhoto=getDishPhoto(checkInData.food.mealTitle,category);const newMoment:FoodMoment={id:`moment-${now}`,title:checkInData.food.mealTitle,label:category==='breakfast'?'Breakfast':category==='lunch'?'Lunch':'Dinner',category,date:checkInData.date,time:checkInData.time,location:'Not specified',locationCategory:'home',imageUrl:matchedPhoto?.url||'',rating:5,mood:checkInData.wellbeing.mood,hungerLevel:checkInData.food.hungerBefore,fullnessLevel:checkInData.food.fullnessAfter,eatingPace:checkInData.food.eatingPace,distraction:checkInData.food.distraction,energyAfter:checkInData.wellbeing.energyLevel>=4?'energized':'neutral',coachFeedback:{title:'Captured',message:checkInData.coachSummary||'Saved for future pattern comparisons.',type:'praise',badge:'Check-in'},notes:checkInData.wellbeing.note,tags:['Check-in',checkInData.timeOfDay],createdAt:now};setMoments(prev=>[newMoment,...prev]);}};

  const cancelMeal=()=>{if(mealStartedAt.current){trackUx({eventName:'flow_finished',surface:'meal_editor',language,durationMs:Date.now()-mealStartedAt.current,outcome:'cancelled'});mealStartedAt.current=null;}setIsAddModalOpen(false);setEditingMoment(null)};
  const cancelCheckin=()=>{if(checkinStartedAt.current){trackUx({eventName:'flow_finished',surface:'checkin',language,durationMs:Date.now()-checkinStartedAt.current,outcome:'cancelled'});checkinStartedAt.current=null;}setIsCheckInModalOpen(false);setIsMiddayCatchUpOpen(false)};
  const handleDeleteMoment=(id:string)=>{setMoments(prev=>prev.filter(m=>m.id!==id));if(selectedMomentDetail?.id===id)setSelectedMomentDetail(null);};
  const handleToggleFavorite=(id:string)=>{setMoments(prev=>prev.map(m=>m.id===id?{...m,isFavorite:!m.isFavorite}:m));if(selectedMomentDetail?.id===id)setSelectedMomentDetail(prev=>prev?{...prev,isFavorite:!prev.isFavorite}:null);};
  const go=(tab:ActiveTab)=>setActiveTab(tab==='type_analysis'?'type_analysis':'today');

  return <div className="min-h-screen bg-[#F4EEE4] text-stone-900 pb-28 md:pb-0"><Header activeTab={activeTab} setActiveTab={go} onOpenAddModal={openCapture}/><main className={`mx-auto ${activeTab==='today'?'px-0 sm:px-4 lg:px-6 pt-0 sm:pt-5':'px-3 sm:px-4 lg:px-6 py-4 sm:py-6'} max-w-7xl`}>{activeTab==='type_analysis'?<NutritionTypeAnalysisView moments={moments} checkIns={checkIns} onOpenCheckIn={openCapture} onOpenAddMoment={openCapture}/>:<TodayHomeView moments={moments} checkIns={checkIns} onSelectMoment={setSelectedMomentDetail} onOpenAddModal={openCapture} onOpenCheckInModal={()=>beginCheckIn('today_phase_card')} onNavigateToCoach={()=>{}} onNavigateToTypeAnalysis={()=>setActiveTab('type_analysis')} onNavigateToTimeline={()=>{}} onSaveCheckIn={handleSaveCheckIn}/>}</main><MobileBottomNav activeTab={activeTab} setActiveTab={go} onCapture={openCapture} favoriteCount={0}/><CaptureChoiceModal isOpen={isCaptureOpen} onClose={()=>setIsCaptureOpen(false)} onFood={()=>{trackUx({eventName:'capture_choice_selected',surface:'capture_choice',language,metadata:{step:'food'}});openFoodCapture()}} onTellCary={()=>{trackUx({eventName:'capture_choice_selected',surface:'capture_choice',language,metadata:{step:'speak'}});beginCheckIn('capture_speak')}} onQuickCheck={()=>{trackUx({eventName:'capture_choice_selected',surface:'capture_choice',language,metadata:{step:'quick'}});beginCheckIn('capture_quick')}}/><AddMomentModal isOpen={isAddModalOpen} onClose={cancelMeal} onSave={handleSaveMoment} editingMoment={editingMoment}/><CatchUpMiddayCheckInModal isOpen={isMiddayCatchUpOpen} onClose={cancelCheckin} onSaveCheckIn={handleSaveCheckIn}/><DailyCheckInModal isOpen={isCheckInModalOpen} onClose={cancelCheckin} onSaveCheckIn={handleSaveCheckIn} existingCheckInsCount={checkIns.length}/><MomentDetailModal moment={selectedMomentDetail} onClose={()=>setSelectedMomentDetail(null)} onEdit={(m)=>{setSelectedMomentDetail(null);setEditingMoment(m);mealStartedAt.current=Date.now();trackUx({eventName:'flow_started',surface:'meal_editor',language,metadata:{source:'edit'}});setIsAddModalOpen(true)}} onDelete={handleDeleteMoment} onToggleFavorite={handleToggleFavorite}/></div>;
}