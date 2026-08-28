/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  FoodMoment, 
  ActiveTab, 
  FilterState, 
  MomentCategory,
  DailyCheckIn
} from './types';
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
import { 
  Sparkles, 
  UtensilsCrossed, 
  Plus, 
  Smartphone, 
  RotateCcw,
  SlidersHorizontal,
  Flame,
  Calendar,
  Layers,
  Heart,
  Brain
} from 'lucide-react';

const STORAGE_KEY = 'nimmapp_moments_v1';
const STORAGE_KEY_CHECKINS = 'nimmapp_checkins_v1';

export default function App() {
  // Moments State initialized from localStorage or rich presets
  const [moments, setMoments] = React.useState<FoodMoment[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('food_journey_moments_v1');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load moments from localStorage', e);
    }
    return INITIAL_FOOD_MOMENTS;
  });

  // Daily Check-ins State (Sleep, Meals, Wellbeing)
  const [checkIns, setCheckIns] = React.useState<DailyCheckIn[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CHECKINS) || localStorage.getItem('getyourcoach_checkins_v1');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load check-ins from localStorage', e);
    }
    return INITIAL_DAILY_CHECK_INS;
  });

  // Save to localStorage on change
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(moments));
    } catch (e) {
      console.error('Failed to save moments to localStorage', e);
    }
  }, [moments]);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CHECKINS, JSON.stringify(checkIns));
    } catch (e) {
      console.error('Failed to save check-ins to localStorage', e);
    }
  }, [checkIns]);

  // UI States - Default to today for intuitive, caring companion experience
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('today');
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = React.useState(false);
  const [editingMoment, setEditingMoment] = React.useState<FoodMoment | null>(null);
  const [selectedMomentDetail, setSelectedMomentDetail] = React.useState<FoodMoment | null>(null);
  const [isMobilePreviewMode, setIsMobilePreviewMode] = React.useState(false);

  // Auto-launch check-in on opening once per session
  React.useEffect(() => {
    const hasLaunched = sessionStorage.getItem('nimmapp_checkin_auto_opened');
    if (!hasLaunched) {
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
      const timer = setTimeout(() => {
        setIsCheckInModalOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Filters State
  const [filterState, setFilterState] = React.useState<FilterState>({
    searchQuery: '',
    selectedCategory: 'all',
    selectedDateRange: 'all',
    selectedMood: 'all',
    onlyFavorites: false,
    minRating: 0,
    selectedTag: 'all',
  });

  // Filter moments
  const filteredMoments = React.useMemo(() => {
    return moments.filter((m) => {
      // Search text query
      if (filterState.searchQuery.trim()) {
        const query = filterState.searchQuery.toLowerCase();
        const matchesTitle = m.title.toLowerCase().includes(query);
        const matchesLabel = (m.label || '').toLowerCase().includes(query);
        const matchesLocation = (m.location || '').toLowerCase().includes(query);
        const matchesNotes = (m.notes || '').toLowerCase().includes(query);
        const matchesTag = m.tags?.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesLabel && !matchesLocation && !matchesNotes && !matchesTag) {
          return false;
        }
      }

      // Category filter (moment.label category)
      if (filterState.selectedCategory !== 'all' && m.category !== filterState.selectedCategory) {
        return false;
      }

      // Mood filter
      if (filterState.selectedMood !== 'all' && m.mood !== filterState.selectedMood) {
        return false;
      }

      // Favorites filter
      if (filterState.onlyFavorites && !m.isFavorite) {
        return false;
      }

      // Min rating
      if (filterState.minRating > 0 && m.rating < filterState.minRating) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort newest date and time first
      const dateA = new Date(`${a.date}T${a.time}`).getTime();
      const dateB = new Date(`${b.date}T${b.time}`).getTime();
      return dateB - dateA;
    });
  }, [moments, filterState]);

  // Counts by category
  const momentCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    moments.forEach((m) => {
      counts[m.category] = (counts[m.category] || 0) + 1;
    });
    return counts;
  }, [moments]);

  const favoriteMoments = React.useMemo(() => {
    return moments.filter((m) => m.isFavorite);
  }, [moments]);

  // Handlers
  const handleSaveMoment = (momentData: Omit<FoodMoment, 'id' | 'createdAt'>) => {
    if (editingMoment) {
      setMoments((prev) =>
        prev.map((m) =>
          m.id === editingMoment.id
            ? { ...momentData, id: m.id, createdAt: m.createdAt }
            : m
        )
      );
      setEditingMoment(null);
    } else {
      const newMoment: FoodMoment = {
        ...momentData,
        id: `moment-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        createdAt: Date.now(),
      };
      setMoments((prev) => [newMoment, ...prev]);
    }
  };

  const handleSaveCheckIn = (checkInData: Omit<DailyCheckIn, 'id' | 'createdAt'>) => {
    const newCheckIn: DailyCheckIn = {
      ...checkInData,
      id: `checkin-${Date.now()}`,
      createdAt: Date.now(),
    };
    setCheckIns((prev) => [newCheckIn, ...prev]);

    // Also auto-add as a FoodMoment in the timeline if food was logged
    if (checkInData.food && checkInData.food.mealTitle) {
      const newMoment: FoodMoment = {
        id: `moment-${Date.now()}`,
        title: checkInData.food.mealTitle,
        label: checkInData.food.category === 'breakfast' ? 'Frühstück' : checkInData.food.category === 'lunch' ? 'Mittagessen' : 'Abendessen',
        category: checkInData.food.category,
        date: checkInData.date,
        time: checkInData.time,
        location: 'Zuhause',
        locationCategory: 'home',
        imageUrl: checkInData.food.category === 'breakfast' 
          ? 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&auto=format&fit=crop&q=80'
          : checkInData.food.category === 'lunch'
            ? 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&auto=format&fit=crop&q=80',
        rating: 5,
        mood: checkInData.wellbeing.mood,
        hungerLevel: checkInData.food.hungerBefore,
        fullnessLevel: checkInData.food.fullnessAfter,
        eatingPace: checkInData.food.eatingPace,
        distraction: checkInData.food.distraction,
        energyAfter: checkInData.wellbeing.energyLevel >= 4 ? 'energized' : 'neutral',
        coachFeedback: {
          title: 'Via Voice-Check-in erfasst',
          message: checkInData.coachSummary || 'Mahlzeit erfolgreich mit NimmApp erfasst.',
          type: 'praise',
          badge: 'Daily Check-in',
        },
        notes: checkInData.wellbeing.note,
        tags: ['Check-in', 'Voice', checkInData.timeOfDay],
        createdAt: Date.now(),
      };
      setMoments((prev) => [newMoment, ...prev]);
    }
  };

  const handleDeleteMoment = (id: string) => {
    setMoments((prev) => prev.filter((m) => m.id !== id));
    if (selectedMomentDetail?.id === id) {
      setSelectedMomentDetail(null);
    }
  };

  const handleToggleFavorite = (id: string) => {
    setMoments((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isFavorite: !m.isFavorite } : m))
    );
    if (selectedMomentDetail?.id === id) {
      setSelectedMomentDetail((prev) =>
        prev ? { ...prev, isFavorite: !prev.isFavorite } : null
      );
    }
  };

  const handleResetSampleData = () => {
    setMoments(INITIAL_FOOD_MOMENTS);
    setCheckIns(INITIAL_DAILY_CHECK_INS);
  };

  // Main Page Content depending on active tab
  const renderMainContent = () => {
    switch (activeTab) {
      case 'today':
        return (
          <TodayHomeView
            moments={moments}
            checkIns={checkIns}
            onSelectMoment={setSelectedMomentDetail}
            onOpenAddModal={() => {
              setEditingMoment(null);
              setIsAddModalOpen(true);
            }}
            onOpenCheckInModal={() => setIsCheckInModalOpen(true)}
            onNavigateToCoach={() => setActiveTab('coach')}
            onNavigateToTypeAnalysis={() => setActiveTab('type_analysis')}
            onNavigateToTimeline={() => setActiveTab('timeline')}
            onSaveCheckIn={handleSaveCheckIn}
          />
        );

      case 'coach':
        return (
          <FoodCoachView
            moments={moments}
            checkIns={checkIns}
            onSelectMoment={setSelectedMomentDetail}
            onOpenAddModal={() => {
              setEditingMoment(null);
              setIsAddModalOpen(true);
            }}
            onOpenCheckInModal={() => setIsCheckInModalOpen(true)}
            onNavigateToTimeline={() => setActiveTab('timeline')}
            onNavigateToTypeAnalysis={() => setActiveTab('type_analysis')}
          />
        );

      case 'type_analysis':
        return (
          <NutritionTypeAnalysisView
            moments={moments}
            checkIns={checkIns}
            onOpenCheckIn={() => setIsCheckInModalOpen(true)}
            onOpenAddMoment={() => {
              setEditingMoment(null);
              setIsAddModalOpen(true);
            }}
          />
        );

      case 'calendar':
        return (
          <FoodCalendarView
            moments={moments}
            onSelectMoment={setSelectedMomentDetail}
            onOpenAddModal={() => {
              setEditingMoment(null);
              setIsAddModalOpen(true);
            }}
          />
        );

      case 'stats':
        return (
          <FoodStatsView
            moments={moments}
            onSelectCategory={(cat) => {
              setFilterState((prev) => ({ ...prev, selectedCategory: cat }));
              setActiveTab('timeline');
            }}
          />
        );

      case 'favorites':
        return (
          <FoodFavoritesView
            favoriteMoments={favoriteMoments}
            onSelectMoment={setSelectedMomentDetail}
            onEditMoment={(m) => {
              setEditingMoment(m);
              setIsAddModalOpen(true);
            }}
            onDeleteMoment={handleDeleteMoment}
            onToggleFavorite={handleToggleFavorite}
            onOpenAddModal={() => {
              setEditingMoment(null);
              setIsAddModalOpen(true);
            }}
          />
        );

      case 'timeline':
      default:
        return (
          <div className="space-y-5">
            
            {/* Quick Filter Section */}
            <div className="bg-white p-3 sm:p-4 rounded-3xl border border-stone-200/80 shadow-xs">
              <MomentCategoryFilter
                filterState={filterState}
                setFilterState={setFilterState}
                momentCounts={momentCounts}
                totalCount={moments.length}
              />
            </div>

            {/* Results Count & Active Filter Indicator */}
            <div className="flex items-center justify-between px-1 text-xs text-stone-500">
              <span className="font-semibold text-stone-800">
                {filteredMoments.length}{' '}
                {filteredMoments.length === 1 ? 'Moment gefunden' : 'Momente gefunden'}
              </span>
              
              {(filterState.selectedCategory !== 'all' ||
                filterState.selectedMood !== 'all' ||
                filterState.onlyFavorites ||
                filterState.searchQuery) && (
                <button
                  onClick={() =>
                    setFilterState({
                      searchQuery: '',
                      selectedCategory: 'all',
                      selectedDateRange: 'all',
                      selectedMood: 'all',
                      onlyFavorites: false,
                      minRating: 0,
                      selectedTag: 'all',
                    })
                  }
                  className="text-amber-600 hover:text-amber-700 font-semibold hover:underline"
                >
                  Filter zurücksetzen
                </button>
              )}
            </div>

            {/* Moments Grid Feed */}
            {filteredMoments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredMoments.map((moment) => (
                  <MomentCard
                    key={moment.id}
                    moment={moment}
                    onSelect={setSelectedMomentDetail}
                    onEdit={(m) => {
                      setEditingMoment(m);
                      setIsAddModalOpen(true);
                    }}
                    onDelete={handleDeleteMoment}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4 bg-white rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
                <UtensilsCrossed className="w-10 h-10 mx-auto text-stone-300" />
                <h3 className="font-display font-bold text-base sm:text-lg text-stone-900">
                  Keine Momente für diese Auswahl gefunden
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Passe deine Suchbegriffe oder Kategorienfilter an, um gespeicherte Essens-Momente anzuzeigen.
                </p>
                <button
                  onClick={() => {
                    setEditingMoment(null);
                    setIsAddModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl font-semibold text-xs hover:bg-amber-600 transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Moment erfassen</span>
                </button>
              </div>
            )}

          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-stone-900 flex flex-col font-sans transition-colors">
      
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setEditingMoment(null);
          setIsAddModalOpen(true);
        }}
        onOpenCheckInModal={() => setIsCheckInModalOpen(true)}
        filterState={filterState}
        setFilterState={setFilterState}
        isMobilePreviewMode={isMobilePreviewMode}
        setIsMobilePreviewMode={setIsMobilePreviewMode}
        totalMoments={moments.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-8 pb-32 sm:pb-12">
        
        {/* If Mobile Preview Shell is toggled on desktop */}
        {isMobilePreviewMode ? (
          <div className="flex flex-col items-center justify-center py-4">
            
            <div className="mb-3 text-xs text-stone-500 flex items-center gap-2 font-medium">
              <Smartphone className="w-4 h-4 text-amber-600" />
              <span>Interaktive Smartphone-Vorschau (390px × 844px)</span>
              <button
                onClick={() => setIsMobilePreviewMode(false)}
                className="ml-2 text-amber-600 underline hover:text-amber-700 font-semibold"
              >
                Zurück zur Standard-Ansicht
              </button>
            </div>

            {/* Smartphone Mockup Frame */}
            <div className="w-full max-w-[400px] h-[820px] bg-white rounded-[48px] p-3.5 shadow-xl border-4 border-stone-300 relative overflow-hidden flex flex-col">
              
              {/* Phone Speaker & Camera Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-6 bg-stone-100 rounded-b-2xl z-50 flex items-center justify-center border-b border-stone-200">
                <div className="w-12 h-3.5 bg-stone-300 rounded-full flex items-center justify-end px-2">
                  <div className="w-2 h-2 rounded-full bg-stone-400" />
                </div>
              </div>

              {/* Mobile Screen Internal Container */}
              <div className="w-full h-full bg-[#FBFBFA] rounded-[38px] overflow-y-auto no-scrollbar relative flex flex-col pt-7 pb-24">
                
                {/* Mobile Top Bar inside frame */}
                <div className="px-4 py-2.5 flex items-center justify-between border-b border-stone-200 bg-white/90 backdrop-blur-xs">
                  <div className="flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-amber-600" />
                    <span className="font-display font-bold text-sm text-stone-900">Cary</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {moments.length + checkIns.length} Logs
                  </span>
                </div>

                {/* Main Inside Mockup Content */}
                <div className="p-3 pb-8">
                  {renderMainContent()}
                </div>

                {/* Mobile Bottom Navigation inside phone frame */}
                <MobileBottomNav
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  onOpenAddModal={() => {
                    setEditingMoment(null);
                    setIsAddModalOpen(true);
                  }}
                  onOpenCheckInModal={() => setIsCheckInModalOpen(true)}
                  favoriteCount={favoriteMoments.length}
                />
              </div>

            </div>

          </div>
        ) : (
          /* Standard Fluid Responsive View */
          renderMainContent()
        )}

      </main>

      {/* Mobile Bottom Navigation (Shown natively on small screens when not in simulated preview mode) */}
      {!isMobilePreviewMode && (
        <div className="md:hidden">
          <MobileBottomNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenAddModal={() => {
              setEditingMoment(null);
              setIsAddModalOpen(true);
            }}
            onOpenCheckInModal={() => setIsCheckInModalOpen(true)}
            favoriteCount={favoriteMoments.length}
          />
        </div>
      )}

      {/* Daily Check-in Survey & WhatsApp Voice Modal */}
      <DailyCheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        onSaveCheckIn={handleSaveCheckIn}
        existingCheckInsCount={checkIns.length}
      />

      {/* Add / Edit Moment Bottom Sheet / Modal */}
      <AddMomentModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingMoment(null);
        }}
        onSave={handleSaveMoment}
        editingMoment={editingMoment}
      />

      {/* Detailed Moment View Modal */}
      <MomentDetailModal
        moment={selectedMomentDetail}
        onClose={() => setSelectedMomentDetail(null)}
        onEdit={(m) => {
          setSelectedMomentDetail(null);
          setEditingMoment(m);
          setIsAddModalOpen(true);
        }}
        onDelete={(id) => {
          handleDeleteMoment(id);
          setSelectedMomentDetail(null);
        }}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Subtle Footer on Desktop */}
      <footer className="hidden sm:block border-t border-stone-200 py-6 px-4 bg-white mt-auto text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-stone-800">Cary</span>
            <span>— Dein fürsorglicher Begleiter für Schlaf, Ernährung & Wohlbefinden</span>
          </div>
          <button
            onClick={handleResetSampleData}
            className="flex items-center gap-1.5 text-stone-500 hover:text-amber-600 transition-colors text-xs font-medium"
            title="Beispieldaten zurücksetzen"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Beispieldaten wiederherstellen</span>
          </button>
        </div>
      </footer>

    </div>
  );
}
