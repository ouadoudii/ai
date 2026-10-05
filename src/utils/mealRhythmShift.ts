import type { AppLanguage } from '../i18n';
import type { FoodMoment, MomentCategory } from '../types';

export type MealRhythmShift = {
  category: MomentCategory;
  recentMinutes: number;
  baselineMinutes: number;
  deltaMinutes: number;
  recentCount: number;
  baselineCount: number;
};

const MEAL_CATEGORIES: MomentCategory[] = ['breakfast', 'lunch', 'dinner'];
const MIN_SAMPLES = 3;
const MIN_SHIFT_MINUTES = 45;

function explicitMinutes(moment: FoodMoment): number | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(moment.time)) return null;
  const [hours, minutes] = moment.time.split(':').map(Number);
  return hours * 60 + minutes;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

export function getMealRhythmShift(moments: FoodMoment[]): MealRhythmShift | null {
  const candidates = MEAL_CATEGORIES.flatMap((category) => {
    const samples = moments
      .filter((moment) => moment.category === category && !moment.id.startsWith('demo-') && !moment.id.startsWith('seed-'))
      .map((moment) => ({ createdAt: moment.createdAt, minutes: explicitMinutes(moment) }))
      .filter((sample): sample is { createdAt: number; minutes: number } => sample.minutes !== null)
      .sort((a, b) => b.createdAt - a.createdAt);

    if (samples.length < MIN_SAMPLES * 2) return [];
    const recent = samples.slice(0, MIN_SAMPLES).map((sample) => sample.minutes);
    const baseline = samples.slice(MIN_SAMPLES, MIN_SAMPLES * 2).map((sample) => sample.minutes);
    const recentMinutes = median(recent);
    const baselineMinutes = median(baseline);
    const deltaMinutes = recentMinutes - baselineMinutes;
    if (Math.abs(deltaMinutes) < MIN_SHIFT_MINUTES) return [];

    return [{ category, recentMinutes, baselineMinutes, deltaMinutes, recentCount: recent.length, baselineCount: baseline.length }];
  });

  return candidates.sort((a, b) => Math.abs(b.deltaMinutes) - Math.abs(a.deltaMinutes))[0] ?? null;
}

const mealNames: Record<AppLanguage, Record<'breakfast'|'lunch'|'dinner', string>> = {
  de: { breakfast: 'Frühstück', lunch: 'Mittagessen', dinner: 'Abendessen' },
  en: { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' },
  fr: { breakfast: 'Petit-déjeuner', lunch: 'Déjeuner', dinner: 'Dîner' },
  ar: { breakfast: 'الفطور', lunch: 'الغداء', dinner: 'العشاء' },
};

const copy: Record<AppLanguage, { title: string; later: (meal: string, minutes: number) => string; earlier: (meal: string, minutes: number) => string; evidence: string }> = {
  de: { title: 'Dein Essrhythmus verändert sich', later: (meal, minutes) => `${meal} liegt zuletzt etwa ${minutes} Min. später als zuvor.`, earlier: (meal, minutes) => `${meal} liegt zuletzt etwa ${minutes} Min. früher als zuvor.`, evidence: 'Verglichen werden deine letzten 3 Einträge mit den 3 davor.' },
  en: { title: 'Your meal rhythm is shifting', later: (meal, minutes) => `${meal} has recently been about ${minutes} min later than before.`, earlier: (meal, minutes) => `${meal} has recently been about ${minutes} min earlier than before.`, evidence: 'This compares your latest 3 entries with the 3 before them.' },
  fr: { title: 'Ton rythme des repas évolue', later: (meal, minutes) => `${meal} est récemment environ ${minutes} min plus tard qu’avant.`, earlier: (meal, minutes) => `${meal} est récemment environ ${minutes} min plus tôt qu’avant.`, evidence: 'Comparaison de tes 3 dernières entrées avec les 3 précédentes.' },
  ar: { title: 'إيقاع وجباتك يتغيّر', later: (meal, minutes) => `${meal} أصبح مؤخراً متأخراً بحوالي ${minutes} دقيقة مقارنةً بالسابق.`, earlier: (meal, minutes) => `${meal} أصبح مؤخراً أبكر بحوالي ${minutes} دقيقة مقارنةً بالسابق.`, evidence: 'نقارن آخر 3 تسجيلات لديك مع التسجيلات الثلاثة التي سبقتها.' },
};

export function localizeMealRhythmShift(shift: MealRhythmShift, language: AppLanguage) {
  const category = shift.category as 'breakfast'|'lunch'|'dinner';
  const meal = mealNames[language][category];
  const minutes = Math.abs(shift.deltaMinutes);
  return {
    title: copy[language].title,
    observation: shift.deltaMinutes > 0 ? copy[language].later(meal, minutes) : copy[language].earlier(meal, minutes),
    evidence: copy[language].evidence,
  };
}
