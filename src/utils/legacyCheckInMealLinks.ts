import type { DailyCheckIn, FoodMoment } from '../types';

export const CHECKIN_SOURCE_TAG = 'source-checkin:';

/**
 * Backfills the explicit source relation for meals created by check-ins before
 * source tags were introduced. Legacy check-in moments were created in the
 * same save operation, so they share createdAt with their source check-in.
 * We only link an exact, unique match; ambiguous history is left untouched.
 */
export function linkLegacyCheckInMeals(
  moments: FoodMoment[],
  checkIns: DailyCheckIn[],
): FoodMoment[] {
  const unlinked = moments.filter(
    moment => !moment.tags.some(tag => tag.startsWith(CHECKIN_SOURCE_TAG)),
  );

  const linkByMomentId = new Map<string, string>();

  for (const checkIn of checkIns) {
    if (!checkIn.food) continue;
    const matches = unlinked.filter(moment =>
      moment.createdAt === checkIn.createdAt &&
      moment.date === checkIn.date &&
      moment.time === checkIn.time &&
      moment.title === checkIn.food?.mealTitle &&
      moment.category === checkIn.food?.category,
    );
    if (matches.length !== 1) continue;

    const moment = matches[0];
    const competingCheckIns = checkIns.filter(candidate =>
      candidate.id !== checkIn.id &&
      candidate.food &&
      candidate.createdAt === moment.createdAt &&
      candidate.date === moment.date &&
      candidate.time === moment.time &&
      candidate.food.mealTitle === moment.title &&
      candidate.food.category === moment.category,
    );
    if (competingCheckIns.length === 0) linkByMomentId.set(moment.id, checkIn.id);
  }

  if (linkByMomentId.size === 0) return moments;
  return moments.map(moment => {
    const sourceId = linkByMomentId.get(moment.id);
    return sourceId
      ? { ...moment, tags: [...moment.tags, `${CHECKIN_SOURCE_TAG}${sourceId}`] }
      : moment;
  });
}
