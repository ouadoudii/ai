import React from 'react';
import {
  History,
  Home,
  MessageCircle,
  Search,
  Sparkles,
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
  filterState,
  setFilterState,
}) => {
  const [showSearchInput, setShowSearchInput] = React.useState(false);
  const items: Array<{ tab: ActiveTab; label: string; icon: React.ReactNode }> = [
    { tab: 'today', label: 'Heute', icon: <Home className="w-3.5 h-3.5" /> },
    { tab: 'type_analysis', label: 'Muster', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { tab: 'coach', label: 'Cary', icon: <MessageCircle className="w-3.5 h-3.5" /> },
    { tab: 'timeline', label: 'Verlauf', icon: <History className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-[#FAFAF9]/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-4">
          <button type="button" onClick={() => setActiveTab('today')} className="flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900">
            <div className="w-9 h-9 rounded-2xl bg-stone-950 text-white flex items-center justify-center font-display font-black text-sm">C</div>
            <div className="text-left">
              <div className="font-display font-bold text-lg text-stone-950 leading-none">Cary</div>
              <div className="hidden sm:block mt-1 text-[10px] font-semibold tracking-wide text-stone-500">Dein Alltag. Dein Muster.</div>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1 rounded-2xl border border-stone-200 bg-white p-1" aria-label="Hauptnavigation">
            {items.map((item) => {
              const active = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  type="button"
                  onClick={() => setActiveTab(item.tab)}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${active ? 'bg-stone-950 text-white' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950'}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.icon}<span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="relative">
            {showSearchInput ? (
              <div className="flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-stone-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Verlauf durchsuchen"
                  value={filterState.searchQuery}
                  onChange={(e) => setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }))}
                  autoFocus
                  className="w-44 sm:w-56 rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-8 text-xs text-stone-900 focus:border-stone-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowSearchInput(false);
                    setFilterState((prev) => ({ ...prev, searchQuery: '' }));
                  }}
                  className="absolute right-2 rounded-lg p-1 text-stone-400 hover:text-stone-800"
                  aria-label="Suche schließen"
                >
                  ×
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setShowSearchInput(true)} className="w-10 h-10 rounded-xl border border-stone-200 bg-white text-stone-600 flex items-center justify-center hover:bg-stone-100" aria-label="Verlauf durchsuchen">
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
