import { describe, expect, it } from 'vitest';
import type { DailyCheckIn, FoodMoment } from '../types';
import { getLocalDateKey } from './dateKey';
import { evaluateNutritionAlarms } from './interventionEngine';

const now = new Date('2026-11-02T15:00:00');
const date = getLocalDateKey(now);
const earlier = now.getTime() - 60_000;
const future = now.getTime() + 5 * 60_000;

const meal = (id: string, createdAt: number, time?: string): FoodMoment => ({
  id, date, time, title: id === 'future-meal' ? 'وجبة مستقبلية' : 'حريرة 7rira',
  label: 'غداء', category: 'lunch', location: 'البيت', locationCategory: 'home',
  imageUrl: '', tags: [], eatingPace: 'rushed', distraction: 'screen',
  createdAt,
} as FoodMoment);

const checkIn = (id: string, createdAt: number, time?: string): DailyCheckIn => ({
  id, date, time, timeOfDay: 'midday',
  sleep: { durationHours: 5, quality: 2, wakeFeeling: 'tired' },
  wellbeing: { energyLevel: 1 }, createdAt,
} as DailyCheckIn);

describe('P0 Guardian clockless future import boundary', () => {
  it('does not present future-dated clockless meal or check-in as a past observation', () => {
    const moments = [meal('future-meal', future)];
    const checkIns = [checkIn('future-checkin', future)];
    const original = JSON.stringify({ moments, checkIns });
    const status = evaluateNutritionAlarms(moments, checkIns, 'intuitive_mindful', now);
    expect(status.activeAlarms).toEqual([]);
    expect(status.statusText).toContain('بلطف');
    expect(JSON.stringify({ moments, checkIns })).toBe(original);
  });

  it('still supports historical clockless entries and valid explicit observed clocks', () => {
    const status = evaluateNutritionAlarms(
      [meal('future-meal', future), meal('legacy-meal', earlier), meal('observed-meal', future, '14:30')],
      [checkIn('future-checkin', future), checkIn('legacy-checkin', earlier)],
      'intuitive_mindful', now,
    );
    const ids = status.activeAlarms.map(item => item.id);
    expect(ids).toContain('alarm-mindless-observed-meal');
    expect(ids).toContain('alarm-sleep-legacy-checkin');
    expect(ids).toContain('alarm-afternoon-crash-checkin-legacy-checkin');
    expect(ids.every(id => !id.includes('future-'))).toBe(true);
    expect(JSON.stringify(status)).not.toMatch(/فشل|عقاب|إنذار|Ghrelin|28%/);
  });

  it('keeps explicit demo observations independent of their synthetic creation timestamp', () => {
    const demoMeal = { ...meal('sim-rushed', future), date: 'Heute' };
    const normal = evaluateNutritionAlarms([demoMeal], [], 'intuitive_mindful', now);
    const demo = evaluateNutritionAlarms([demoMeal], [], 'intuitive_mindful', now, true);
    expect(normal.activeAlarms).toEqual([]);
    expect(demo.activeAlarms.some(item => item.triggerKey === 'distracted_meal')).toBe(true);
  });
});
