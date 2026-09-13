import type { AppLanguage } from '../i18n';
import type { MomentCategory } from '../types';

const labels: Record<AppLanguage, Record<'breakfast'|'lunch'|'dinner', string>> = {
  en: { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' },
  de: { breakfast: 'Frühstück', lunch: 'Mittagessen', dinner: 'Abendessen' },
  fr: { breakfast: 'Petit-déjeuner', lunch: 'Déjeuner', dinner: 'Dîner' },
  ar: { breakfast: 'فطور', lunch: 'غداء', dinner: 'عشاء' },
};

const metadata: Record<AppLanguage, { location: string; captured: string; fallbackSummary: string; badge: string }> = {
  en: { location: 'Not specified', captured: 'Captured', fallbackSummary: 'Saved for future pattern comparisons.', badge: 'Check-in' },
  de: { location: 'Nicht angegeben', captured: 'Erfasst', fallbackSummary: 'Für spätere Mustervergleiche gespeichert.', badge: 'Check-in' },
  fr: { location: 'Non précisé', captured: 'Enregistré', fallbackSummary: 'Enregistré pour de futures comparaisons de tendances.', badge: 'Check-in' },
  ar: { location: 'غير محدد', captured: 'تم التسجيل', fallbackSummary: 'تم الحفظ لمقارنة الأنماط لاحقًا.', badge: 'تسجيل' },
};

export const getCheckInMomentCopy = (language: AppLanguage, category: MomentCategory) => {
  const mealCategory = category === 'breakfast' || category === 'lunch' || category === 'dinner' ? category : 'dinner';
  return {
    label: labels[language][mealCategory],
    ...metadata[language],
  };
};
