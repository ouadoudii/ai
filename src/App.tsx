/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FoodMoment, ActiveTab, FilterState, MomentCategory, DailyCheckIn, TimeOfDayPhase } from './types';
import { INITIAL_FOOD_MOMENTS, MOMENT_LABELS } from './data/momentsData';
import { INITIAL_DAILY_CHECK_INS } from './data/checkInsData';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MomentCategoryFilter } from './components/MomentCategoryFilter';
import { MomentCard } from './components/MomentCard';
import { AddMomentModal } from './components/AddMomentModal';
import { MomentDetailModal } from './components/MomentDetailModal';
import { FoodStatsView } from './components/FoodStatsView';
import { FoodCalendarView } from './components/FoodCalendarView';
import { FoodFavoritesView } from './components/FoodFavoritesView';
import { FoodCoachView } from './components/FoodCoachView';
import { TodayHomeView } from './components/TodayHomeView';
import { DailyCheckInModal } from './components/DailyCheckInModal';
import { NutritionTypeAnalysisView } from './components/NutritionTypeAnalysisView';
import { getLocalDateKey } from './utils/dateKey';
import { UtensilsCrossed, Plus } from 'lucide-react';

const STORAGE_KEY = 'nimmapp_moments_v1';
const STORAGE_KEY_CHECKINS = 'nimmapp_checkins_v1';
const SEEDED_CHECKIN_IDS = new Set(['checkin-1', 'checkin-2', 'checkin-3']);

const getEligibleDayparts = (hour: number): TimeOfDayPhase[] => {
  if (hour >= 5 && hour < 11) return ['morning'];
  if (hour >= 11 && hour < 16) return ['morning', 'midday'];
  return ['morning', 'midday', 'evening'];
};

export default function App() {
  const [moments, setMoments] = React.useState<FoodMoment[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('food_journey_moments_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) { console.error('Failed to load moments from localStorage', e); }
    return INITIAL_FOOD_MOMENTS;
  });

  const [checkIns, setCheckIns] = React.useState<DailyCheckIn[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CHECKINS) || localStorage.getItem('getyourcoach_checkins_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) { console.error('Failed to load check-ins from localStorage', e); }
    return INITIAL_DAILY_CHECK_INS;
  });

  React.useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(moments)); } catch (e) { console.error('Failed to save moments to localStorage', e); } }, [moments]);
  React.useEffect(() => { try { localStorage.setItem(STORAGE_KEY_CHECKINS, JSON.stringify(checkIns)); } catch (e) { console.error('Failed to save check-ins to localStorage', e); } }, [checkIns]);

  const [activeTab, setActiveTab] = React.useState<ActiveTab>('today');
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = React.useState(false);
  const [editingMoment, setEditingMoment] = React.useState<FoodMoment | null>(null);
  const [selectedMomentDetail, setSelectedMomentDetail] = React.useState<FoodMoment | null>(null);
  const [isMobilePreviewMode, setIsMobilePreviewMode] = React.useState(false);

  React.useEffect(() => {
    const today = getLocalDateKey();
    const completedToday = new Set(
      checkIns
        .filter((checkIn) => checkIn.date === today && !SEEDED_CHECKIN_IDS.has(checkIn.id))
        .map((checkIn) => checkIn.timeOfDay),
    );
    const hasMissingEligibleDaypart = getEligibleDayparts(new Date().getHours()).some((phase) => !completedToday.has(phase));
    const hasLaunchedThisSession = sessionStorage.getItem('nimmapp_checkin_auto_opened') === 'true';
    if (!hasMissingEligibleDaypart || hasLaunchedThisSession) return;

    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    const timer = setTimeout(() => setIsCheckInModalOpen(true), 500);
    return () => clearTimeout(timer);
  }, [checkIns]);

  const [filterState, setFilterState] = React.useState<FilterState>({ searchQuery: '', selectedCategory: 'all', selectedDateRange: 'all', selectedMood: 'all', onlyFavorites: false, minRating: 0, selectedTag: 'all' });

  const filteredMoments = React.useMemo(() => moments.filter((m) => {
    if (filterState.searchQuery.trim()) {
      const query = filterState.searchQuery.toLowerCase();
      const matches = m.title.toLowerCase().includes(query) || (m.label || '').toLowerCase().includes(query) || (m.location || '').toLowerCase().includes(query) || (m.notes || '').toLowerCase().includes(query) || m.tags?.some((t) => t.toLowerCase().includes(query));
      if (!matches) return false;
    }
    if (filterState.selectedCategory !== 'all' && m.category !== filterState.selectedCategory) return false;
    if (filterState.selectedMood !== 'all' && m.mood !== filterState.selectedMood) return false;
    if (filterState.onlyFavorites && !m.isFavorite) return false;
    if (filterState.minRating > 0 && m.rating < filterState.minRating) return false;
    return true;
  }).sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime()), [moments, filterState]);

  const momentCounts = React.useMemo(() => { const counts: Record<string, number> = {}; moments.forEach((m) => { counts[m.category] = (counts[m.category] || 0) + 1; }); return counts; }, [moments]);
  const favoriteMoments = React.useMemo(() => moments.filter((m) => m.isFavorite), [moments]);

  const handleSaveMoment = (momentData: Omit<FoodMoment, 'id' | 'createdAt'>) => {
    if (editingMoment) { setMoments((prev) => prev.map((m) => m.id === editingMoment.id ? { ...momentData, id: m.id, createdAt: m.createdAt } : m)); setEditingMoment(null); }
    else setMoments((prev) => [{ ...momentData, id: `moment-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, createdAt: Date.now() }, ...prev]);
  };

  const handleSaveCheckIn = (checkInData: Omit<DailyCheckIn, 'id' | 'createdAt'>) => {
    const now = Date.now();
    const newCheckIn: DailyCheckIn = { ...checkInData, id: `user-checkin-${now}`, createdAt: now };
    setCheckIns((prev) => [newCheckIn, ...prev.filter((c) => !(c.date === checkInData.date && c.timeOfDay === checkInData.timeOfDay && !SEEDED_CHECKIN_IDS.has(c.id)))]);
    if (checkInData.food?.mealTitle) {
      const newMoment: FoodMoment = { id: `moment-${now}`, title: checkInData.food.mealTitle, label: checkInData.food.category === 'breakfast' ? 'Frühstück' : checkInData.food.category === 'lunch' ? 'Mittagessen' : 'Abendessen', category: checkInData.food.category, date: checkInData.date, time: checkInData.time, location: 'Zuhause', locationCategory: 'home', imageUrl: checkInData.food.category === 'breakfast' ? 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&auto=format&fit=crop&q=80' : checkInData.food.category === 'lunch' ? 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&auto=format&fit=crop&q=80', rating: 5, mood: checkInData.wellbeing.mood, hungerLevel: checkInData.food.hungerBefore, fullnessLevel: checkInData.food.fullnessAfter, eatingPace: checkInData.food.eatingPace, distraction: checkInData.food.distraction, energyAfter: checkInData.wellbeing.energyLevel >= 4 ? 'energized' : 'neutral', coachFeedback: { title: 'Via Voice-Check-in erfasst', message: checkInData.coachSummary || 'Mahlzeit erfolgreich mit Cary erfasst.', type: 'praise', badge: 'Daily Check-in' }, notes: checkInData.wellbeing.note, tags: ['Check-in', 'Voice', checkInData.timeOfDay], createdAt: now };
      setMoments((prev) => [newMoment, ...prev]);
    }
  };

  const handleDeleteMoment = (id: string) => { setMoments((prev) => prev.filter((m) => m.id !== id)); if (selectedMomentDetail?.id === id) setSelectedMomentDetail(null); };
  const handleToggleFavorite = (id: string) => { setMoments((prev) => prev.map((m) => m.id === id ? { ...m, isFavorite: !m.isFavorite } : m)); if (selectedMomentDetail?.id === id) setSelectedMomentDetail((prev) => prev ? { ...prev, isFavorite: !prev.isFavorite } : null); };
  const handleResetSampleData = () => { setMoments(INITIAL_FOOD_MOMENTS); setCheckIns(INITIAL_DAILY_CHECK_INS); };

  const renderMainContent = () => {
    switch (activeTab) {
      case 'today': return <TodayHomeView moments={moments} checkIns={checkIns} onSelectMoment={setSelectedMomentDetail} onOpenAddModal={() => { setEditingMoment(null); setIsAddModalOpen(true); }} onOpenCheckInModal={() => setIsCheckInModalOpen(true)} onNavigateToCoach={() => setActiveTab('coach')} onNavigateToTypeAnalysis={() => setActiveTab('type_analysis')} onNavigateToTimeline={() => setActiveTab('timeline')} onSaveCheckIn={handleSaveCheckIn} />;
      case 'coach': return <FoodCoachView moments={moments} checkIns={checkIns} onSelectMoment={setSelectedMomentDetail} onOpenAddModal={() => { setEditingMoment(null); setIsAddModalOpen(true); }} onOpenCheckInModal={() => setIsCheckInModalOpen(true)} onNavigateToTimeline={() => setActiveTab('timeline')} onNavigateToTypeAnalysis={() => setActiveTab('type_analysis')} />;
      case 'type_analysis': return <NutritionTypeAnalysisView moments={moments} checkIns={checkIns} onOpenCheckIn={() => setIsCheckInModalOpen(true)} onOpenAddMoment={() => { setEditingMoment(null); setIsAddModalOpen(true); }} />;
      case 'calendar': return <FoodCalendarView moments={moments} onSelectMoment={setSelectedMomentDetail} onOpenAddModal={() => { setEditingMoment(null); setIsAddModalOpen(true); }} />;
      case 'stats': return <FoodStatsView moments={moments} onSelectCategory={(cat) => { setFilterState((prev) => ({ ...prev, selectedCategory: cat })); setActiveTab('timeline'); }} />;
      case 'favorites': return <FoodFavoritesView favoriteMoments={favoriteMoments} onSelectMoment={setSelectedMomentDetail} onEditMoment={(m) => { setEditingMoment(m); setIsAddModalOpen(true); }} onDeleteMoment={handleDeleteMoment} onToggleFavorite={handleToggleFavorite} onOpenAddModal={() => { setEditingMoment(null); setIsAddModalOpen(true); }} />;
      case 'timeline': default: return <div className="space-y-5"><div className="bg-white p-3 sm:p-4 rounded-3xl border border-stone-200/80 shadow-xs"><MomentCategoryFilter filterState={filterState} setFilterState={setFilterState} momentCounts={momentCounts} totalCount={moments.length} /></div><div className="flex items-center justify-between px-1 text-xs text-stone-500"><span className="font-semibold text-stone-800">{filteredMoments.length} {filteredMoments.length === 1 ? 'Moment gefunden' : 'Momente gefunden'}</span>{(filterState.selectedCategory !== 'all' || filterState.selectedMood !== 'all' || filterState.onlyFavorites || filterState.searchQuery) && <button onClick={() => setFilterState({ searchQuery: '', selectedCategory: 'all', selectedDateRange: 'all', selectedMood: 'all', onlyFavorites: false, minRating: 0, selectedTag: 'all' })} className="text-amber-600 hover:text-amber-700 font-semibold hover:underline">Filter zurücksetzen</button>}</div>{filteredMoments.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">{filteredMoments.map((moment) => <MomentCard key={moment.id} moment={moment} onSelect={setSelectedMomentDetail} onEdit={(m) => { setEditingMoment(m); setIsAddModalOpen(true); }} onDelete={handleDeleteMoment} onToggleFavorite={handleToggleFavorite} />)}</div> : <div className="text-center py-16 px-4 bg-white rounded-3xl border border-stone-200/80 shadow-xs space-y-3"><UtensilsCrossed className="w-10 h-10 mx-auto text-stone-300" /><h3 className="font-display font-bold text-base sm:text-lg text-stone-900">Keine Momente für diese Auswahl gefunden</h3><p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">Starte dein kulinarisches Tagebuch und halte deinen ersten besonderen Moment fest.</p><button onClick={() => { setEditingMoment(null); setIsAddModalOpen(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-amber-600"><Plus className="w-4 h-4" />Ersten Moment hinzufügen</button></div>}</div>;
    }
  };

  return <div className="min-h-screen bg-[#FAFAF9] text-stone-900 pb-24 md:pb-0"><Header activeTab={activeTab} setActiveTab={setActiveTab} filterState={filterState} setFilterState={setFilterState} onOpenAddModal={() => { setEditingMoment(null); setIsAddModalOpen(true); }} onOpenCheckInModal={() => setIsCheckInModalOpen(true)} isMobilePreviewMode={isMobilePreviewMode} setIsMobilePreviewMode={setIsMobilePreviewMode} totalMoments={moments.length} /><main className={`mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 ${isMobilePreviewMode ? 'max-w-md' : 'max-w-7xl'}`}>{renderMainContent()}</main><MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} onOpenAddModal={() => { setEditingMoment(null); setIsAddModalOpen(true); }} onOpenCheckInModal={() => setIsCheckInModalOpen(true)} favoriteCount={favoriteMoments.length} /><AddMomentModal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setEditingMoment(null); }} onSave={handleSaveMoment} editingMoment={editingMoment} momentLabels={MOMENT_LABELS} /><DailyCheckInModal isOpen={isCheckInModalOpen} onClose={() => setIsCheckInModalOpen(false)} onSaveCheckIn={handleSaveCheckIn} existingCheckInsCount={checkIns.length} /><MomentDetailModal moment={selectedMomentDetail} isOpen={!!selectedMomentDetail} onClose={() => setSelectedMomentDetail(null)} onEdit={(m) => { setSelectedMomentDetail(null); setEditingMoment(m); setIsAddModalOpen(true); }} onDelete={handleDeleteMoment} onToggleFavorite={handleToggleFavorite} /></div>;
}
