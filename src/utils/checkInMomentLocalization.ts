import type { AppLanguage } from '../i18n';
import type { MomentCategory } from '../types';

const labels: Record<AppLanguage, Record<'breakfast'|'lunch'|'dinner'|'snack', string>> = {
  en: { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' },
  de: { breakfast: 'Frühstück', lunch: 'Mittagessen', dinner: 'Abendessen', snack: 'Snack' },
  ar: { breakfast: 'فطور', lunch: 'غداء', dinner: 'عشاء', snack: 'وجبة خفيفة' },
};

const metadata: Record<AppLanguage, { location: string; captured: string; fallbackSummary: string; badge: string }> = {
  en: { location: 'Not specified', captured: 'Captured', fallbackSummary: 'Saved for future pattern comparisons.', badge: 'Check-in' },
  de: { location: 'Nicht angegeben', captured: 'Erfasst', fallbackSummary: 'Für spätere Mustervergleiche gespeichert.', badge: 'Check-in' },
  ar: { location: 'غير محدد', captured: 'تم التسجيل', fallbackSummary: 'تم الحفظ لمقارنة الأنماط لاحقًا.', badge: 'تسجيل' },
};

export const getCheckInMomentCopy = (language: AppLanguage, category: MomentCategory) => {
  const mealCategory = category === 'breakfast' || category === 'lunch' || category === 'dinner' || category === 'snack' ? category : 'dinner';
  return {
    label: labels[language][mealCategory],
    ...metadata[language],
  };
};
