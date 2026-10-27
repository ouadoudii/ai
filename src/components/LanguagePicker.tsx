import React from "react";
import { Download } from "lucide-react";
import type { DailyCheckIn, FoodMoment } from "../types";
import { downloadPersonalDataExport } from "../utils/personalDataExport";
import { trackUx } from "../utils/uxAnalytics";

interface Props {
  surface: "header" | "bottom_nav";
  className?: string;
  iconClassName?: string;
  compact?: boolean;
}

const readArray = <T,>(key: string, legacyKey: string): T[] => {
  try {
    const raw = localStorage.getItem(key) || localStorage.getItem(legacyKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// Arabic is the only product UI language. Keep data export directly accessible
// without exposing a redundant language-selection dialog.
export const PersonalDataExportButton: React.FC<Props> = ({
  surface,
  className = "",
  iconClassName = "h-4 w-4",
  compact = false,
}) => {
  const exportData = () => {
    const moments = readArray<FoodMoment>(
      "nimmapp_moments_v1",
      "food_journey_moments_v1",
    );
    const checkIns = readArray<DailyCheckIn>(
      "nimmapp_checkins_v1",
      "getyourcoach_checkins_v1",
    );
    downloadPersonalDataExport(moments, checkIns);
    trackUx({
      eventName: "personal_data_exported",
      surface,
      language: "ar",
      metadata: { moments: moments.length, checkins: checkIns.length },
    });
  };
  return (
    <button
      type="button"
      data-testid="personal-data-export"
      aria-label="تصدير بياناتي"
      onClick={exportData}
      className={className}
    >
      <Download className={iconClassName} aria-hidden="true" />
      <span>{compact ? "بياناتي" : "تصدير بياناتي"}</span>
    </button>
  );
};
