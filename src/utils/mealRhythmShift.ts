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
