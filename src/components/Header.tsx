import React from 'react';
import { 
  Sparkles, 
  Plus, 
  Smartphone, 
  Monitor, 
  Search, 
  Calendar,
  BarChart3,
  Brain,
  Mic,
  Dna
} from 'lucide-react';
import { ActiveTab, FilterState } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onOpenCheckInModal: () => void;
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  isMobilePreviewMode: boolean;
  setIsMobilePreviewMode: (mode: boolean) => void;
  totalMoments: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenCheckInModal,
  filterState,
  setFilterState,
  isMobilePreviewMode,
  setIsMobilePreviewMode,
  totalMoments,
}) => {
  const [showSearchInput, setShowSearchInput] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Brand: Cary */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('coach')}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-amber-500 text-white flex items-center justify-center font-bold rounded-2xl shrink-0 shadow-xs ring-2 ring-amber-500/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-lg sm:text-xl text-stone-900 tracking-tight">
                  Cary
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-full">
                  Fürsorglich
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                Fürsorge • Achtsamkeit • Wohlbefinden
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-100/80 p-1 rounded-2xl border border-stone-200/60">
            <button
              id="tab-today"
              onClick={() => setActiveTab('today')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'today'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'today' ? 'text-white' : 'text-amber-600'}`} />
              <span>Heute</span>
            </button>

            <button
              id="tab-coach"
              onClick={() => setActiveTab('coach')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'coach'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <Brain className={`w-3.5 h-3.5 ${activeTab === 'coach' ? 'text-white' : 'text-emerald-600'}`} />
              <span>Coach & Typ</span>
            </button>

            <button
              id="tab-timeline"
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'timeline'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <Calendar className={`w-3.5 h-3.5 ${activeTab === 'timeline' ? 'text-white' : 'text-stone-500'}`} />
              <span>Tagebuch</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Search Toggle / Input */}
            <div className="relative">
              {showSearchInput ? (
                <div className="flex items-center animate-in fade-in zoom-in-95 duration-150">
                  <input
                    type="text"
                    placeholder="Suchen nach Gerichten..."
                    value={filterState.searchQuery}
                    onChange={(e) =>
                      setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }))
                    }
                    autoFocus
                    className="w-40 sm:w-56 pl-8 pr-8 py-1.5 text-xs bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:border-amber-500 focus:bg-white focus:outline-hidden"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    onClick={() => {
                      setShowSearchInput(false);
                      setFilterState((prev) => ({ ...prev, searchQuery: '' }));
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  id="btn-search-toggle"
                  onClick={() => setShowSearchInput(true)}
                  className="p-2 text-stone-600 hover:text-stone-900 rounded-xl bg-stone-100/80 hover:bg-stone-200/80 border border-stone-200/60 transition-colors"
                  title="Suchen"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Green WhatsApp Voice Check-in Action with "Sag's mir!" */}
            <button
              id="btn-voice-checkin-header"
              onClick={onOpenCheckInModal}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all ring-2 ring-emerald-500/20 shrink-0"
              title="Sag's mir! - Tages- & Sprach-Check-in starten"
            >
              <Mic className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden xs:inline">Sag's mir!</span>
            </button>

            {/* Mobile View Simulator Toggle */}
            <button
              id="btn-mobile-preview-toggle"
              onClick={() => setIsMobilePreviewMode(!isMobilePreviewMode)}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isMobilePreviewMode
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-50 text-stone-600 border-stone-200/80 hover:bg-stone-100 hover:text-stone-900'
              }`}
              title="Smartphone-Vorschau umschalten"
            >
              {isMobilePreviewMode ? (
                <>
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobilansicht</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </>
              )}
            </button>

            {/* Add Moment CTA Button */}
            <button
              id="btn-add-moment-header"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Mahlzeit erfassen</span>
              <span className="sm:hidden text-xs">+ Neu</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};


