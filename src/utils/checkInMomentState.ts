import { DailyCheckIn, FoodMoment, TimeOfDayPhase } from '../types';

const CHECKIN_SOURCE_TAG = 'source-checkin:';

export function getCheckInSourceId(moment: FoodMoment): string | undefined {
  return moment.tags.find(tag => tag.startsWith(CHECKIN_SOURCE_TAG))?.slice(CHECKIN_SOURCE_TAG.length);
}

export function reconcileCheckInMoments(
  moments: FoodMoment[],
  checkIns: DailyCheckIn[],
  date: string,
  timeOfDay: TimeOfDayPhase,
  replacement?: FoodMoment,
): FoodMoment[] {
  const replacedIds = new Set(
    checkIns
      .filter(checkIn => checkIn.date === date && checkIn.timeOfDay === timeOfDay)
      .map(checkIn => checkIn.id),
  );
  const retained = moments.filter(moment => {
    const sourceId = getCheckInSourceId(moment);
    return !sourceId || !replacedIds.has(sourceId);
  });
  if (!replacement) return retained;
  const { rating: _syntheticRating, ...unratedReplacement } = replacement;
  return [unratedReplacement, ...retained];
}

export function reconcileCheckInFromMomentEdit(
  checkIns: DailyCheckIn[],
  previousMoment: FoodMoment,
  editedMoment: FoodMoment,
): DailyCheckIn[] {
  const sourceId = getCheckInSourceId(previousMoment);
  if (!sourceId) return checkIns;

  return checkIns.map(checkIn => {
    if (checkIn.id !== sourceId) return checkIn;
    return {
      ...checkIn,
      date: editedMoment.date,
      time: editedMoment.time,
      food: {
        ...(checkIn.food || {}),
        mealTitle: editedMoment.title,
        category: editedMoment.category,
        hungerBefore: editedMoment.hungerLevel,
        fullnessAfter: editedMoment.fullnessLevel,
        eatingPace: editedMoment.eatingPace,
        distraction: editedMoment.distraction,
      },
      wellbeing: {
        ...checkIn.wellbeing,
        mood: editedMoment.mood,
        note: editedMoment.notes,
      },
    };
  });
}

export { CHECKIN_SOURCE_TAG };
