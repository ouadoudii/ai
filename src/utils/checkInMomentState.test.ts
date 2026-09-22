import { describe, expect, it } from 'vitest';
import { DailyCheckIn, FoodMoment } from '../types';
import { CHECKIN_SOURCE_TAG, reconcileCheckInMoments } from './checkInMomentState';

const checkIn = (id: string, date = '2026-09-23', timeOfDay: DailyCheckIn['timeOfDay'] = 'midday') => ({
  id,
  date,
  timeOfDay,
} as DailyCheckIn);

const moment = (id: string, sourceId?: string) => ({
  id,
  tags: sourceId ? [`${CHECKIN_SOURCE_TAG}${sourceId}`] : ['manual'],
} as FoodMoment);

describe('reconcileCheckInMoments', () => {
  it('replaces the moment linked to the corrected same-phase check-in', () => {
    const previous = checkIn('checkin-old');
    const oldMeal = moment('meal-old', previous.id);
    const manualMeal = moment('meal-manual');
    const correctedMeal = moment('meal-new', 'checkin-new');

    expect(reconcileCheckInMoments([oldMeal, manualMeal], [previous], previous.date, previous.timeOfDay, correctedMeal))
      .toEqual([correctedMeal, manualMeal]);
  });

  it('removes the old linked meal when the correction no longer contains food', () => {
    const previous = checkIn('checkin-old');
    const oldMeal = moment('meal-old', previous.id);
    const manualMeal = moment('meal-manual');

    expect(reconcileCheckInMoments([oldMeal, manualMeal], [previous], previous.date, previous.timeOfDay))
      .toEqual([manualMeal]);
  });

  it('does not touch linked meals from another date or phase', () => {
    const corrected = checkIn('corrected');
    const otherPhase = checkIn('other-phase', corrected.date, 'evening');
    const otherDate = checkIn('other-date', '2026-09-22', 'midday');
    const keepPhase = moment('keep-phase', otherPhase.id);
    const keepDate = moment('keep-date', otherDate.id);

    expect(reconcileCheckInMoments([keepPhase, keepDate], [corrected, otherPhase, otherDate], corrected.date, corrected.timeOfDay))
      .toEqual([keepPhase, keepDate]);
  });
});
