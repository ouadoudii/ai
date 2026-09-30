import { FoodMoment } from '../types';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const isValidDateKey = (value: string): boolean => {
  if (!ISO_DATE.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

const previousDateKey = (value: string): string => {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
};

const isDemoMoment = (moment: FoodMoment): boolean =>
  moment.id.startsWith('demo-') || moment.id.startsWith('sim-') || moment.tags?.some((tag) => /demo|simuliert|seed/i.test(tag)) === true;

/** Returns the consecutive-day streak ending on the user's most recent real logged date. */
export const deriveMealLoggingStreak = (moments: FoodMoment[]): number => {
  const dates = new Set(
    moments
      .filter((moment) => !isDemoMoment(moment) && isValidDateKey(moment.date))
      .map((moment) => moment.date)
  );
  if (dates.size === 0) return 0;

  const newest = [...dates].sort().at(-1)!;
  let cursor = newest;
  let streak = 0;
  while (dates.has(cursor)) {
    streak += 1;
    cursor = previousDateKey(cursor);
  }
  return streak;
};
