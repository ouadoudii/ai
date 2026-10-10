import type { FoodMoment, MomentCategory } from './types';

const VALID_TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

function toMinutes(time: string): number | null {
  const match = VALID_TIME.exec(time.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function isDemo(moment: FoodMoment): boolean {
  return moment.id.startsWith('demo-') || moment.tags?.includes('demo') || moment.tags?.includes('Demo');
}

/**
 * Returns a user's typical explicit time for a meal category.
 * Uses a circular mean so observations around midnight do not average to noon.
 * Requires at least three real observations and never mutates user data.
 */
export function deriveUsualMealTime(
  moments: FoodMoment[],
  category: MomentCategory,
  minimumObservations = 3,
): string | null {
  const minutes = moments
    .filter(moment => moment.category === category && !isDemo(moment))
    .map(moment => toMinutes(moment.time ?? ''))
    .filter((value): value is number => value !== null);

  if (minutes.length < minimumObservations) return null;

  const angles = minutes.map(value => (value / 1440) * Math.PI * 2);
  const sin = angles.reduce((sum, angle) => sum + Math.sin(angle), 0);
  const cos = angles.reduce((sum, angle) => sum + Math.cos(angle), 0);
  if (Math.abs(sin) < 1e-9 && Math.abs(cos) < 1e-9) return null;

  let angle = Math.atan2(sin, cos);
  if (angle < 0) angle += Math.PI * 2;
  const rounded = Math.round((angle / (Math.PI * 2)) * 1440) % 1440;
  const hours = Math.floor(rounded / 60).toString().padStart(2, '0');
  const mins = (rounded % 60).toString().padStart(2, '0');
  return `${hours}:${mins}`;
}
