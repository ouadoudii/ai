import { DailyCheckIn } from '../types';
import { getLocalDateKey } from './dateKey';

export const LATE_NIGHT_CATCH_UP_END_HOUR = 5;

export function getPreviousLocalDateKey(now: Date): string {
  const previousDay = new Date(now);
  previousDay.setDate(previousDay.getDate() - 1);
  return getLocalDateKey(previousDay);
}

export function getLateNightEveningTarget(
  now: Date,
  checkIns: DailyCheckIn[],
  ignoredIds: ReadonlySet<string> = new Set(),
): string | null {
  if (now.getHours() >= LATE_NIGHT_CATCH_UP_END_HOUR) return null;

  const previousDate = getPreviousLocalDateKey(now);
  const previousChecks = checkIns.filter(
    checkIn => checkIn.date === previousDate && !ignoredIds.has(checkIn.id),
  );

  if (!previousChecks.length) return null;
  if (previousChecks.some(checkIn => checkIn.timeOfDay === 'evening')) return null;
  return previousDate;
}
