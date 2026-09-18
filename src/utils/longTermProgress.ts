import { DailyCheckIn } from '../types';

export type ProgressDirection = 'improved' | 'declined' | 'stable';
export type ProgressMetric = 'sleep' | 'energy' | 'stress' | 'mealRhythm';

export interface ProgressInsight {
  metric: ProgressMetric;
  direction: ProgressDirection;
  earlier: number;
  recent: number;
  unit: 'hours' | 'level' | 'mealsPerDay';
  earlierDays: number;
  recentDays: number;
}

type DailySample = { date: string; sleep?: number; energy?: number; stress?: number; meals: number };

const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
const rounded = (value: number) => Math.round(value * 10) / 10;

function dailySamples(checkIns: DailyCheckIn[]): DailySample[] {
  const byDate = new Map<string, DailySample>();
  for (const entry of checkIns) {
    if (!byDate.has(entry.date)) byDate.set(entry.date, { date: entry.date, meals: 0 });
    const day = byDate.get(entry.date)!;
    if (entry.sleep?.durationHours != null) day.sleep = entry.sleep.durationHours;
    if (entry.wellbeing.energyLevel != null) day.energy = entry.wellbeing.energyLevel;
    if (entry.wellbeing.stressLevel != null) day.stress = entry.wellbeing.stressLevel;
    if (entry.food?.mealTitle) day.meals += 1;
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function direction(earlier: number, recent: number, lowerIsBetter = false): ProgressDirection {
  const delta = recent - earlier;
  const meaningful = Math.abs(delta) >= 0.25;
  if (!meaningful) return 'stable';
  const improved = lowerIsBetter ? delta < 0 : delta > 0;
  return improved ? 'improved' : 'declined';
}

/**
 * Compares the oldest and newest halves of real recorded days. No synthetic score is
 * created: every insight exposes the two observed averages and sample sizes.
 */
export function deriveLongTermProgress(checkIns: DailyCheckIn[]): ProgressInsight[] {
  const days = dailySamples(checkIns);
  if (days.length < 6) return [];
  const split = Math.floor(days.length / 2);
  const earlierDays = days.slice(0, split);
  const recentDays = days.slice(days.length - split);
  const result: ProgressInsight[] = [];

  const add = (metric: ProgressMetric, key: 'sleep' | 'energy' | 'stress', unit: 'hours' | 'level', lowerIsBetter = false) => {
    const earlierValues = earlierDays.map(day => day[key]).filter((value): value is number => value != null);
    const recentValues = recentDays.map(day => day[key]).filter((value): value is number => value != null);
    if (earlierValues.length < 2 || recentValues.length < 2) return;
    const earlier = average(earlierValues);
    const recent = average(recentValues);
    result.push({ metric, direction: direction(earlier, recent, lowerIsBetter), earlier: rounded(earlier), recent: rounded(recent), unit, earlierDays: earlierValues.length, recentDays: recentValues.length });
  };

  add('sleep', 'sleep', 'hours');
  add('energy', 'energy', 'level');
  add('stress', 'stress', 'level', true);

  const earlierMeals = average(earlierDays.map(day => day.meals));
  const recentMeals = average(recentDays.map(day => day.meals));
  result.push({ metric: 'mealRhythm', direction: direction(earlierMeals, recentMeals), earlier: rounded(earlierMeals), recent: rounded(recentMeals), unit: 'mealsPerDay', earlierDays: earlierDays.length, recentDays: recentDays.length });
  return result;
}
