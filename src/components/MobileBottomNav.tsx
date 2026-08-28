import React from 'react';
import { 
  Sparkles, 
  Calendar, 
  Plus, 
  BarChart3, 
  Brain,
  Mic,
  Dna
} from 'lucide-react';
import { ActiveTab } from '../types';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onOpenCheckInModal: () => void;
  favoriteCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenCheckInModal,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200 safe-pb shadow-lg">
      <div className="max-w-md mx-auto px-3 py-2 flex items-center justify-between">
        
        {/* Tab 1: Heute */}
        <button
          id="mobile-nav-today"
          onClick={() => setActiveTab('today')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'today'
              ? 'text-amber-800 font-semibold'
              : 'text-stone-600 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <Sparkles className="w-5 h-5" />
            {activeTab === 'today' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-500 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium">Heute</span>
        </button>

        {/* Tab 2: Coach & Typ */}
        <button
          id="mobile-nav-coach"
          onClick={() => setActiveTab('coach')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'coach'
              ? 'text-amber-800 font-semibold'
              : 'text-stone-600 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <Brain className="w-5 h-5" />
            {activeTab === 'coach' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-500 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium">Coach</span>
        </button>

        {/* Center Primary Action: Green WhatsApp Voice Check-in with "Sag's mir!" */}
        <div className="flex flex-col items-center relative -top-3">
          <button
            id="mobile-nav-voice-btn"
            onClick={onOpenCheckInModal}
            className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform focus:outline-hidden font-bold ring-3 ring-emerald-500/20"
            aria-label="Sag's mir - Sprach-Check-in starten"
            title="Sag's mir!"
          >
            <Mic className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className="text-[9px] font-bold text-[#1da851] mt-0.5 tracking-tight">Sag's mir!</span>
        </div>

        {/* Tab 3: Ernährungstyp */}
        <button
          id="mobile-nav-type"
          onClick={() => setActiveTab('type_analysis')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'type_analysis'
              ? 'text-amber-800 font-semibold'
              : 'text-stone-600 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <Dna className="w-5 h-5" />
            {activeTab === 'type_analysis' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-500 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium">Typ</span>
        </button>

        {/* Tab 4: Tagebuch */}
        <button
          id="mobile-nav-timeline"
          onClick={() => setActiveTab('timeline')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'timeline'
              ? 'text-amber-800 font-semibold'
              : 'text-stone-600 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <Calendar className="w-5 h-5" />
            {activeTab === 'timeline' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-500 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium">Tagebuch</span>
        </button>

      </div>
    </div>
  );
};



