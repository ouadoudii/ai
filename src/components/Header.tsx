import React from "react";
import {
  Activity,
  CalendarDays,
  Home,
  MessageSquare,
  Plus,
  Sprout,
} from "lucide-react";
import { ActiveTab } from "../types";
import { useLanguage } from "../i18n";
import { PersonalDataExportButton } from "./LanguagePicker";
interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
}
export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
}) => {
  const { language, t } = useLanguage();
  const ar = language === "ar";
  return (
    <header className="hidden md:block sticky top-0 z-30 bg-[#FFFCF6]/95 backdrop-blur-xl border-b border-[#E7DDCD] shadow-[0_8px_30px_rgba(50,61,47,.035)]">
      <div className="max-w-[1280px] mx-auto px-6 xl:px-10 h-20 flex items-center justify-between gap-6">
        <button
          onClick={() => setActiveTab("today")}
          className="flex shrink-0 items-center gap-3 font-display font-black text-2xl tracking-tight text-[#2D3B31]"
        >
          <span className="w-11 h-11 rounded-2xl bg-[#315F4F] text-white grid place-items-center shadow-[0_8px_20px_rgba(49,95,79,.18)]">
            <Sprout className="w-4 h-4" />
          </span>
          <span>{ar ? "إيقاع" : "Rhythm"}</span>
        </button>
        <nav
          className="flex items-center gap-1 bg-[#F2EDE3] rounded-2xl p-1.5 border border-[#E8DECF]"
          aria-label={t("mainNav")}
        >
          <button
            onClick={() => setActiveTab("today")}
            className={`rounded-xl px-4 py-3 text-sm font-bold flex gap-2 items-center transition-colors ${activeTab === "today" ? "bg-[#315F4F] text-white shadow-sm" : "text-[#706F68]"}`}
          >
            <Home className="w-3.5 h-3.5" />
            {t("today")}
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`rounded-xl px-4 py-3 text-sm font-bold flex gap-2 items-center transition-colors ${activeTab === "timeline" ? "bg-[#315F4F] text-white shadow-sm" : "text-[#706F68]"}`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            {t("entries")}
          </button>
          <button
            data-testid="desktop-capture-button"
            onClick={onOpenAddModal}
            className="rounded-xl px-4 py-3 text-sm font-bold flex gap-2 items-center transition-colors bg-[#A15E3D] text-white shadow-[0_5px_14px_rgba(161,94,61,.16)] hover:bg-[#87492D]"
          >
            <Plus className="w-3.5 h-3.5" />
            {t("add")}
          </button>
          <button
            onClick={() => setActiveTab("coach")}
            data-testid="desktop-coach-nav"
            className={`rounded-xl px-4 py-3 text-sm font-bold flex gap-2 items-center transition-colors ${activeTab === "coach" ? "bg-[#315F4F] text-white shadow-sm" : "text-[#706F68]"}`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {t("navCoach")}
          </button>
          <button
            onClick={() => setActiveTab("type_analysis")}
            className={`rounded-xl px-4 py-3 text-sm font-bold flex gap-2 items-center transition-colors ${activeTab === "type_analysis" ? "bg-[#315F4F] text-white shadow-sm" : "text-[#706F68]"}`}
          >
            <Activity className="w-3.5 h-3.5" />
            {t("patterns")}
          </button>
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <PersonalDataExportButton
            surface="header"
            compact
            className="rounded-full bg-white/90 border border-[#E2D8CA] px-3.5 py-2 text-xs font-black text-[#4B584C] shadow-sm inline-flex items-center gap-1.5"
            iconClassName="w-3.5 h-3.5"
          />
        </div>
      </div>
    </header>
  );
};
