import type { FoodMoment } from '../types';

export interface MealVarietyInsight {
  mealCount: number;
  distinctMealCount: number;
  distinctRatio: number;
}

const isDemoMoment = (moment: FoodMoment) => /^moment-\d{1,2}$/.test(moment.id);
const mealKey = (title: string) => title.trim().replace(/\s+/g, ' ').toLocaleLowerCase();

/**
 * Summarises variety across the user's most recent real meals. The result is
 * deliberately observational: callers decide how to phrase it and should not
 * turn the ratio into a nutrition/health judgement.
 */
export function getMealVarietyInsight(
  moments: FoodMoment[],
  windowSize = 10,
  minimumMeals = 6,
): MealVarietyInsight | null {
  const eligible = moments
    .filter((moment) => !isDemoMoment(moment) && Boolean(moment.title.trim()))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, Math.max(0, windowSize));

  if (eligible.length < Math.max(1, minimumMeals)) return null;

  const distinctMealCount = new Set(eligible.map((moment) => mealKey(moment.title))).size;
  return {
    mealCount: eligible.length,
    distinctMealCount,
    distinctRatio: distinctMealCount / eligible.length,
  };
}
