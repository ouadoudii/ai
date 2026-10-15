import { describe, expect, it } from 'vitest';
import { DailyCheckIn, FoodMoment, TimeOfDayPhase } from '../types';
import { CHECKIN_SOURCE_TAG, reconcileCheckInFromMomentEdit, reconcileCheckInMoments } from './checkInMomentState';

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

  it('removes synthetic ratings from check-in-derived meals', () => {
    const replacement = { ...moment('meal-new', 'checkin-new'), rating: 5 };

    const [saved] = reconcileCheckInMoments([], [], replacement.date, 'midday', replacement);

    expect(saved.rating).toBeUndefined();
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

describe('reconcileCheckInFromMomentEdit', () => {
  it('updates the linked check-in fields while preserving unrelated wellbeing and sleep history', () => {
    const source: DailyCheckIn = {
      ...checkIn('checkin-linked'),
      sleep: { durationHours: 7.5, quality: 4 },
      food: { mealTitle: 'Couscous', category: 'lunch', hungerBefore: 4, fullnessAfter: 3 },
      wellbeing: { energyLevel: 2, stressLevel: 4, waterGlasses: 1, mood: 'satisfied', note: 'old note', voiceTranscription: 'original voice' },
    };
    const original = { ...moment('meal-linked', source.id), title: 'Couscous', notes: 'old note' };
    const edited: FoodMoment = {
      ...original,
      title: 'سلطة · Salat',
      date: '2026-09-24',
      time: '13:15',
      category: 'snack',
      hungerLevel: 2,
      fullnessLevel: 4,
      eatingPace: 'slow',
      distraction: 'social',
      mood: 'energized',
      notes: 'corrected note',
    };

    const [updated] = reconcileCheckInFromMomentEdit([source], original, edited);

    expect(updated).toMatchObject({
      id: source.id,
      date: edited.date,
      time: edited.time,
      food: {
        mealTitle: edited.title,
        category: edited.category,
        hungerBefore: 2,
        fullnessAfter: 4,
        eatingPace: 'slow',
        distraction: 'social',
      },
      wellbeing: {
        energyLevel: 2,
        stressLevel: 4,
        waterGlasses: 1,
        mood: 'energized',
        note: 'corrected note',
        voiceTranscription: 'original voice',
      },
      sleep: source.sleep,
    });
  });

  it('does not mutate check-ins for a standalone meal edit', () => {
    const existing = checkIn('checkin-unrelated');
    const standalone = moment('manual-meal');

    expect(reconcileCheckInFromMomentEdit([existing], standalone, { ...standalone, title: 'Edited' }))
      .toBeInstanceOf(Array);
    expect(reconcileCheckInFromMomentEdit([existing], standalone, { ...standalone, title: 'Edited' }))
      .toEqual([existing]);
  });

  it('leaves all check-ins unchanged when the source id no longer exists', () => {
    const existing = checkIn('checkin-current');
    const linked = moment('linked-meal', 'checkin-missing');

    expect(reconcileCheckInFromMomentEdit([existing], linked, { ...linked, title: 'Edited' }))
      .toEqual([existing]);
  });
});
