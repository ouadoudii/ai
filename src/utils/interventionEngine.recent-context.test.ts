import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DailyCheckIn, FoodMoment } from '../types';
import { getLocalDateKey } from './dateKey';
import { evaluateNutritionAlarms } from './interventionEngine';

const moment = (date: string, id = 'meal-1'): FoodMoment => ({
  id, title: 'حريرة Harira', label: 'عشاء', category: 'dinner',
  date, time: '12:30', location: 'الرباط', locationCategory: 'home',
  imageUrl: '', mood: 'comfort', tags: ['Darija'], createdAt: Date.now(),
  eatingPace: 'rushed', distraction: 'screen', fullnessLevel: 2,
});
const checkIn = (date: string, id = 'checkin-1'): DailyCheckIn => ({
  id, date, time: '08:00', timeOfDay: 'morning',
  sleep: { durationHours: 5, quality: 2, wakeFeeling: 'exhausted' },
  wellbeing: { energyLevel: 1 }, createdAt: Date.now(),
});

describe('Guardian local-day context and gentle Arabic suggestions', () => {
  afterEach(() => vi.useRealTimers());

  it('does not turn old or future entries into alarms about today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T14:00:00'));
    const result = evaluateNutritionAlarms(
      [moment('2026-09-01'), moment('2026-10-29', 'future-meal')],
      [checkIn('2026-09-01'), checkIn('2026-10-29', 'future-checkin')],
    );
    expect(result.activeAlarms).toEqual([]);
    expect(result.statusText).toContain('بلطف');
    expect(result.statusBadge).toBe('green');
  });

  it('uses current entries even when an older entry is first in storage', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T14:00:00'));
    const today = getLocalDateKey();
    const result = evaluateNutritionAlarms(
      [moment('2026-09-01', 'old-meal'), moment(today, 'today-meal')],
      [checkIn('2026-09-01', 'old-checkin'), checkIn(today, 'today-checkin')],
    );
    expect(result.activeAlarms.map(alarm => alarm.id)).toEqual(expect.arrayContaining([
      'alarm-sleep-today-checkin',
      'alarm-mindless-today-meal',
      'alarm-afternoon-crash-checkin-today-checkin',
    ]));
    expect(result.activeAlarms.every(alarm => !alarm.id.includes('old-'))).toBe(true);
    expect(result.activeAlarms.map(alarm => alarm.title).join(' ')).not.toMatch(/فشل|عقاب|كüchenschluss|Überessen/i);
  });

  it('keeps source occurrence IDs stable and accepts only explicit simulator markers', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T10:00:00'));
    const simulated = evaluateNutritionAlarms(
      [moment('Heute', 'sim-rushed-1'), moment('Heute', 'real-old-legacy')],
      [checkIn('Heute', 'sim-sleep-1'), checkIn('Heute', 'real-old-checkin')],
    );
    expect(simulated.activeAlarms.map(alarm => alarm.id)).toEqual([
      'alarm-sleep-sim-sleep-1',
      'alarm-mindless-sim-rushed-1',
    ]);
    expect(evaluateNutritionAlarms([moment('Heute', 'real-old-legacy')], []).activeAlarms).toEqual([]);
  });

  it('does not mistake a low-energy entry from another day for an afternoon prompt', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T15:00:00'));
    const result = evaluateNutritionAlarms([], [checkIn('2026-10-27', 'yesterday')]);
    expect(result.activeAlarms).toEqual([]);
  });
});
