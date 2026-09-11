import { MomentCategory } from '../types';
import { VoiceLanguage } from '../apiClient';

const LABELS: Record<VoiceLanguage, Partial<Record<MomentCategory, string>>> = {
  en: {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
    dessert: 'Dessert',
    coffee: 'Coffee',
    drinks: 'Drink',
  },
  de: {
    breakfast: 'Frühstück',
    lunch: 'Mittagessen',
    dinner: 'Abendessen',
    snack: 'Snack',
    dessert: 'Dessert',
    coffee: 'Kaffee',
    drinks: 'Getränk',
  },
  ar: {
    breakfast: 'الفطور',
    lunch: 'الغداء',
    dinner: 'العشاء',
    snack: 'وجبة خفيفة',
    dessert: 'حلويات',
    coffee: 'قهوة',
    drinks: 'مشروب',
  },
};

const LOCATION_NOT_SPECIFIED: Record<VoiceLanguage, string> = {
  en: 'Not specified',
  de: 'Nicht angegeben',
  ar: 'غير محدد',
};

export function mealLabelFor(category: MomentCategory, language: VoiceLanguage): string {
  return LABELS[language][category] || category;
}

export function unspecifiedLocationFor(language: VoiceLanguage): string {
  return LOCATION_NOT_SPECIFIED[language];
}
