import { describe, expect, it } from 'vitest';
import type { DailyCheckIn, FoodMoment } from '../types';
import { getLocalDateKey } from './dateKey';
import { evaluateNutritionAlarms } from './interventionEngine';

describe('Guardian explicit demo clock boundary', () => {
  const atThree = new Date('2026-10-28T15:00:00');
  const today = getLocalDateKey(atThree);

  const futurePersonalMeal = {
    id: 'sim-personal-future-meal', date: today, time: '19:00',
    title: 'حريرة', eatingPace: 'rushed', distraction: 'screen',
    createdAt: 1,
  } as FoodMoment;
  const legacyPersonalCheckIn = {
    id: 'sim-personal-import', date: 'Heute', time: '07:00',
    sleep: { durationHours: 4, quality: 1, wakeFeeling: 'exhausted' },
    createdAt: 2,
  } as DailyCheckIn;

  it('does not treat a personal sim-prefixed ID as permission to bypass the clock or date', () => {
    const moments = [futurePersonalMeal];
    const checkIns = [legacyPersonalCheckIn];
    const before = JSON.stringify({ moments, checkIns });
    const result = evaluateNutritionAlarms(moments, checkIns, 'intuitive_mindful', atThree);
    expect(result.activeAlarms).toEqual([]);
    expect(result.statusBadge).toBe('green');
    expect(result.statusText).toContain('بلطف');
    expect(JSON.stringify({ moments, checkIns })).toBe(before);
  });

  it('keeps synthetic examples usable only when the caller explicitly enables demo mode', () => {
    const demoMeal = { ...futurePersonalMeal, id: 'sim-rushed-1' };
    const demoCheckIn = { ...legacyPersonalCheckIn, id: 'sim-sleep-1' };
    const withoutDemo = evaluateNutritionAlarms([demoMeal], [demoCheckIn], 'intuitive_mindful', atThree);
    expect(withoutDemo.activeAlarms).toEqual([]);

    const withDemo = evaluateNutritionAlarms(
      [demoMeal], [demoCheckIn], 'intuitive_mindful', atThree, true,
    );
    expect(withDemo.activeAlarms.map(alarm => alarm.triggerKey)).toContain('distracted_meal');
    expect(withDemo.activeAlarms.map(alarm => alarm.triggerKey)).toContain('sleep_deficit');
    expect(JSON.stringify(withDemo)).not.toMatch(/فشل|عقاب|إنذار|Ghrelin|28%/);
  });

  it('still honors genuinely observed personal entries whose IDs happen to start with sim-', () => {
    const meal = { ...futurePersonalMeal, time: '12:00' };
    const checkIn = { ...legacyPersonalCheckIn, date: today, time: '08:00' };
    const result = evaluateNutritionAlarms([meal], [checkIn], 'intuitive_mindful', atThree);
    expect(result.activeAlarms.map(alarm => alarm.triggerKey)).toContain('distracted_meal');
    expect(result.activeAlarms.map(alarm => alarm.triggerKey)).toContain('sleep_deficit');
    expect(result.activeAlarms.every(alarm => !/فشل|عقاب|إنذار/.test(alarm.reason))).toBe(true);
  });
});
