import { describe, expect, it } from 'vitest';
import type { DailyCheckIn, FoodMoment } from '../types';
import { getLocalDateKey } from './dateKey';
import { evaluateNutritionAlarms } from './interventionEngine';

const at = new Date('2026-11-02T15:00:00');
const today = getLocalDateKey(at);
const meal = (time: unknown): FoodMoment => ({
  id: 'imported-harira', title: 'حريرة 7rira', label: 'غداء',
  category: 'lunch', date: today, time: time as string,
  location: 'البيت', locationCategory: 'home', imageUrl: '',
  tags: ['Darija'], eatingPace: 'rushed', distraction: 'screen',
  createdAt: 100,
} as FoodMoment);
const checkIn = (time: unknown): DailyCheckIn => ({
  id: 'imported-checkin', date: today, time: time as string,
  timeOfDay: 'midday',
  sleep: { durationHours: 5, quality: 2, wakeFeeling: 'tired' },
  wellbeing: { energyLevel: 1 }, createdAt: 200,
} as DailyCheckIn);

describe('P0 Guardian impossible observation clocks', () => {
  it('does not infer a meal, sleep or low-energy observation from an impossible explicit time', () => {
    for (const badClock of ['99:99', '24:00', '14:xx', 123]) {
      const moments = [meal(badClock)];
      const checkIns = [checkIn(badClock)];
      const before = JSON.stringify({ moments, checkIns });
      const status = evaluateNutritionAlarms(moments, checkIns, 'intuitive_mindful', at);
      expect(status.activeAlarms).toEqual([]);
      expect(status.statusText).toContain('بلطف');
      expect(status.statusBadge).toBe('green');
      expect(JSON.stringify({ moments, checkIns })).toBe(before);
    }
  });

  it('keeps valid and clockless legacy observations without letting corrupt imports override them', () => {
    const validMeal = { ...meal('12:00'), id: 'real-harira' };
    const validCheckIn = { ...checkIn('08:00'), id: 'real-checkin' };
    const corruptMeal = { ...meal('99:99'), id: 'corrupt-meal', createdAt: 999 };
    const corruptCheckIn = { ...checkIn('99:99'), id: 'corrupt-checkin', createdAt: 999 };
    const status = evaluateNutritionAlarms(
      [corruptMeal, validMeal], [corruptCheckIn, validCheckIn], 'intuitive_mindful', at,
    );
    expect(status.activeAlarms.map(alarm => alarm.id)).toEqual(expect.arrayContaining([
      'alarm-sleep-real-checkin', 'alarm-mindless-real-harira',
      'alarm-afternoon-crash-checkin-real-checkin',
    ]));
    expect(status.activeAlarms.every(alarm => !alarm.id.includes('corrupt'))).toBe(true);
    expect(JSON.stringify(status)).not.toMatch(/فشل|عقاب|إنذار|Ghrelin|28%/);

    const clockless = evaluateNutritionAlarms(
      [meal(undefined)], [checkIn(undefined)], 'intuitive_mindful', at,
    );
    expect(clockless.activeAlarms.map(alarm => alarm.triggerKey)).toEqual(expect.arrayContaining([
      'sleep_deficit', 'distracted_meal', 'afternoon_crash',
    ]));
  });

  it('accepts a real observation at the current minute, not a future minute', () => {
    expect(evaluateNutritionAlarms([meal('15:00')], [], 'intuitive_mindful', at)
      .activeAlarms.some(alarm => alarm.triggerKey === 'distracted_meal')).toBe(true);
    expect(evaluateNutritionAlarms([meal('15:01')], [], 'intuitive_mindful', at)
      .activeAlarms).toEqual([]);
  });
});
