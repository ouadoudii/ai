import type { FoodMoment } from '../types';

const DEMO_IDS = new Set(['moment-1', 'moment-2', 'moment-3']);
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

function previousDateKey(dateKey: string): string | null {
  if (!DATE_KEY.test(dateKey)) return null;
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime())) return null;
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) return null;
  date.setUTCDate(date.getUTCDate() - 1);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

export function getMealLoggingStreak(moments: FoodMoment[]): number {
  const dates = new Set(
    moments
      .filter((moment) => !DEMO_IDS.has(moment.id) && previousDateKey(moment.date) !== null)
      .map((moment) => moment.date),
  );
  if (!dates.size) return 0;

  let cursor = [...dates].sort().at(-1)!;
  let streak = 0;
  while (dates.has(cursor)) {
    streak += 1;
    const previous = previousDateKey(cursor);
    if (!previous) break;
    cursor = previous;
  }
  return streak;
}
