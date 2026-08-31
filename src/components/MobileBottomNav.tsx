import React from 'react';
import { Home, History, MessageCircle, Compass } from 'lucide-react';
import { ActiveTab } from '../types';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onOpenCheckInModal: () => void;
  favoriteCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, setActiveTab }) => {
  const items: Array<{ tab: ActiveTab; label: string; icon: React.ReactNode }> = [
    { tab: 'today', label: 'Heute', icon: <Home className="w-5 h-5" /> },
    { tab: 'type_analysis', label: 'Entdecken', icon: <Compass className="w-5 h-5" /> },
    { tab: 'coach', label: 'Cary', icon: <MessageCircle className="w-5 h-5" /> },
    { tab: 'timeline', label: 'Verlauf', icon: <History className="w-5 h-5" /> },
  ];
  return <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(.55rem,env(safe-area-inset-bottom))]" aria-label="Hauptnavigation"><div className="max-w-md mx-auto grid grid-cols-4 gap-1 rounded-[24px] bg-[#30231E]/95 p-1.5 shadow-[0_16px_40px_rgba(55,35,25,.28)] backdrop-blur-xl">{items.map(item=>{const active=activeTab===item.tab;return <button key={item.tab} type="button" onClick={()=>setActiveTab(item.tab)} className={`min-h-13 rounded-[18px] flex flex-col items-center justify-center gap-1 transition-all ${active?'bg-[#FFF4E8] text-[#6E412D] shadow-sm':'text-[#E9DCD3] hover:bg-white/10'}`} aria-current={active?'page':undefined}><span aria-hidden="true">{item.icon}</span><span className="text-[10px] font-bold">{item.label}</span></button>})}</div></nav>;
};