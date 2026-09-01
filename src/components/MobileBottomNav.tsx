import React from 'react';
import { Home, History, MessageCircle, Activity, Plus } from 'lucide-react';
import { ActiveTab } from '../types';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onCapture: () => void;
  favoriteCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, setActiveTab, onCapture }) => {
  const left: Array<{ tab: ActiveTab; label: string; icon: React.ReactNode }> = [
    { tab: 'today', label: 'Heute', icon: <Home className="w-5 h-5" /> },
    { tab: 'type_analysis', label: 'Muster', icon: <Activity className="w-5 h-5" /> },
  ];
  const right: Array<{ tab: ActiveTab; label: string; icon: React.ReactNode }> = [
    { tab: 'coach', label: 'Fragen', icon: <MessageCircle className="w-5 h-5" /> },
    { tab: 'timeline', label: 'Verlauf', icon: <History className="w-5 h-5" /> },
  ];

  const itemButton = (item: { tab: ActiveTab; label: string; icon: React.ReactNode }) => {
    const active = activeTab === item.tab;
    return <button key={item.tab} type="button" onClick={() => setActiveTab(item.tab)} className={`min-h-13 rounded-[18px] flex flex-col items-center justify-center gap-1 transition-all ${active ? 'bg-[#FFF4E8] text-[#6E412D] shadow-sm' : 'text-[#E9DCD3] hover:bg-white/10'}`} aria-current={active ? 'page' : undefined}><span aria-hidden="true">{item.icon}</span><span className="text-[10px] font-bold">{item.label}</span></button>;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(.55rem,env(safe-area-inset-bottom))]" aria-label="Hauptnavigation">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1 rounded-[26px] bg-[#30231E]/96 p-1.5 shadow-[0_16px_40px_rgba(55,35,25,.28)] backdrop-blur-xl">
        {left.map(itemButton)}
        <button type="button" onClick={onCapture} className="relative -mt-5 min-h-16 rounded-[22px] bg-[#E86F45] text-white flex flex-col items-center justify-center gap-1 shadow-[0_10px_26px_rgba(232,111,69,.38)] border-4 border-[#FAFAF9]" aria-label="Neuen Eintrag hinzufügen"><Plus className="w-6 h-6" /><span className="text-[9px] font-black">Neu</span></button>
        {right.map(itemButton)}
      </div>
    </nav>
  );
};
