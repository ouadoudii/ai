import { describe, expect, it } from 'vitest';
import { DailyCheckIn, FoodMoment, TimeOfDayPhase } from '../types';
import { CHECKIN_SOURCE_TAG, reconcileCheckInMoments } from './checkInMomentState';

const checkIn = (id: string, date = '2026-09-23', timeOfDay: TimeOfDayPhase = 'midday'): DailyCheckIn => ({
  id,
  date,
  time: '12:30',
  timeOfDay,
  wellbeing: {},
  createdAt: 1,
});

const moment = (id: string, sourceId?: string): FoodMoment => ({
  id,
  title: id,
  label: id,
  category: 'lunch',
  date: '2026-09-23',
  time: '12:30',
  location: 'home',
  locationCategory: 'home',
  imageUrl: '',
  mood: 'satisfied',
  tags: sourceId ? [`${CHECKIN_SOURCE_TAG}${sourceId}`] : ['manual'],
  createdAt: 1,
});

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
