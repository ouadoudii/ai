import { describe, expect, it } from 'vitest';
import type { FoodMoment } from '../types';
import { calculateCoachingMetrics, deriveDailyCoachingGoals, INITIAL_COACHING_GOALS } from './coachEngine';

const moment = (overrides: Partial<FoodMoment> = {}): FoodMoment => ({
  id: 'meal-1', title: 'كسكس', label: 'غداء', category: 'lunch',
  date: '2026-10-29', time: '13:00', location: 'Home', locationCategory: 'home',
  imageUrl: '', mood: 'satisfied', tags: [], createdAt: 1,
  ...overrides,
});

describe('honest Arabic Coach progress', () => {
  it('does not invent scores, screen-free meals or streaks for an empty journal', () => {
    const metrics = calculateCoachingMetrics([]);
    expect(metrics.todayMomentsCount).toBe(0);
    expect(metrics.screenFreeRatio).toBe(0);
    expect(metrics.screenFreeObservations).toBe(0);
    expect(metrics.slowEatingRatio).toBe(0);
    expect(metrics.mindfulScore).toBe(0);
    expect(metrics.satietyBalanceScore).toBe(0);
    expect(metrics.streaksDays).toBe(0);
    expect(deriveDailyCoachingGoals([], '2026-10-29').every((goal) => goal.current === 0 && !goal.completed)).toBe(true);
    expect(INITIAL_COACHING_GOALS.every((goal) => goal.current === 0 && !goal.completed)).toBe(true);
  });

  it('does not carry yesterday’s Coach progress into a new local day', () => {
    const meals = [moment({ hungerLevel: 3, distraction: 'mindful', fullnessLevel: 4 })];
    const yesterday = calculateCoachingMetrics(meals, '2026-10-29');
    expect(yesterday.todayMomentsCount).toBe(1);
    expect(yesterday.screenFreeRatio).toBe(100);
    const nextDay = calculateCoachingMetrics(meals, '2026-10-30');
    expect(nextDay.todayMomentsCount).toBe(0);
    expect(nextDay.screenFreeRatio).toBe(0);
    expect(nextDay.screenFreeObservations).toBe(0);
    expect(nextDay.mindfulScore).toBe(0);
    expect(nextDay.satietyBalanceScore).toBe(0);
    expect(deriveDailyCoachingGoals(meals, '2026-10-30').every((goal) => goal.current === 0)).toBe(true);
    expect(meals).toHaveLength(1);
  });

  it('counts only explicit screen-free observations, not missing fields', () => {
    const metrics = calculateCoachingMetrics([moment(), moment({ id: 'meal-2', distraction: 'screen' })]);
    expect(metrics.screenFreeObservations).toBe(1);
    expect(metrics.screenFreeRatio).toBe(0);
    const unknown = calculateCoachingMetrics([moment()]);
    expect(unknown.screenFreeObservations).toBe(0);
    expect(unknown.screenFreeRatio).toBe(0);
  });

  it('derives daily goals from recorded meals without changing the journal', () => {
    const meals = [
      moment({ hungerLevel: 3, distraction: 'mindful', fullnessLevel: 4, nutrition: { protein: 25 } }),
      moment({ id: 'meal-2', date: '2026-10-28', hungerLevel: 4, distraction: 'mindful', fullnessLevel: 4, nutrition: { protein: 30 } }),
      moment({ id: 'meal-3', category: 'snack', distraction: 'mindful' }),
    ];
    const before = JSON.stringify(meals);
    const goals = deriveDailyCoachingGoals(meals, '2026-10-29');
    expect(goals.map((goal) => goal.current)).toEqual([1, 1, 1, 1]);
    expect(goals.every((goal) => !goal.completed)).toBe(true);
    expect(JSON.stringify(meals)).toBe(before);
  });

  it('can only complete an observed goal with enough actual entries from that day', () => {
    const meals = Array.from({ length: 3 }, (_, i) => moment({
      id: `meal-${i}`, hungerLevel: 3, distraction: 'mindful',
      fullnessLevel: 4, nutrition: { protein: 22 },
    }));
    const goals = deriveDailyCoachingGoals(meals, '2026-10-29');
    expect(goals.map((goal) => goal.current)).toEqual([3, 2, 3, 3]);
    expect(goals.every((goal) => goal.completed)).toBe(true);
    expect(deriveDailyCoachingGoals(meals, '2026-10-30').every((goal) => goal.current === 0 && !goal.completed)).toBe(true);
  });
});
