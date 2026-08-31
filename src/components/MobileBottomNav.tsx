import React from 'react';
import {
  Home,
  History,
  MessageCircle,
  Sparkles,
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
}) => {
  const items: Array<{ tab: ActiveTab; label: string; icon: React.ReactNode }> = [
    { tab: 'today', label: 'Heute', icon: <Home className="w-5 h-5" /> },
    { tab: 'type_analysis', label: 'Muster', icon: <Sparkles className="w-5 h-5" /> },
    { tab: 'coach', label: 'Cary', icon: <MessageCircle className="w-5 h-5" /> },
    { tab: 'timeline', label: 'Verlauf', icon: <History className="w-5 h-5" /> },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200 safe-pb"
      aria-label="Hauptnavigation"
    >
      <div className="max-w-md mx-auto px-3 py-2 grid grid-cols-4 gap-1">
        {items.map((item) => {
          const active = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => setActiveTab(item.tab)}
              className={`min-h-12 rounded-2xl flex flex-col items-center justify-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 ${active ? 'bg-stone-950 text-white' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'}`}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span className="text-[10px] font-bold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
