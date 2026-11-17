import { describe, expect, it } from 'vitest';
import { calculateCoachingMetrics } from './coachEngine';
import type { FoodMoment } from '../types';

const date = '2026-11-17';
const meal = (overrides: Partial<FoodMoment> = {}): FoodMoment =>
  ({ id: 'meal-1', date, category: 'lunch', ...overrides }) as FoodMoment;

describe('coach observations without invented grades (#447)', () => {
  it('does not assign a mindfulness or satiety grade based on food or feelings', () => {
    const calm = calculateCoachingMetrics([meal({ fullnessLevel: 3, distraction: 'mindful', eatingPace: 'slow', rating: 5 })], date);
    const busy = calculateCoachingMetrics([meal({ fullnessLevel: 5, distraction: 'screen', eatingPace: 'rushed', rating: 1 })], date);
    expect(calm.mindfulScore).toBe(0);
    expect(busy.mindfulScore).toBe(0);
    expect(calm.satietyBalanceScore).toBe(0);
    expect(busy.satietyBalanceScore).toBe(0);
    expect(calm.satietyObservations).toBe(1);
    expect(busy.satietyObservations).toBe(1);
    expect(busy.coachSummary).not.toMatch(/فشل|سيئ|ذنب|عقاب|88%|28%/);
  });

  it('does not infer observations from missing values or prior days', () => {
    const result = calculateCoachingMetrics([
      meal({ date: '2026-11-16', fullnessLevel: 4, distraction: 'mindful' }),
      meal({ distraction: undefined, fullnessLevel: undefined }),
    ], date);
    expect(result.todayMomentsCount).toBe(1);
    expect(result.satietyObservations).toBe(0);
    expect(result.screenFreeObservations).toBe(0);
    expect(result.screenFreeRatio).toBe(0);
    expect(result.coachSummary).not.toMatch(/فشل|سيئ|ذنب|عقاب/);
  });

  it('keeps explicitly observed ratios distinct from moral scores', () => {
    const result = calculateCoachingMetrics([
      meal({ distraction: 'mindful', eatingPace: 'slow' }),
      meal({ id: 'meal-2', distraction: 'work', eatingPace: 'moderate' }),
    ], date);
    expect(result.screenFreeObservations).toBe(2);
    expect(result.screenFreeRatio).toBe(50);
    expect(result.slowEatingRatio).toBe(50);
    expect(result.mindfulScore).toBe(0);
  });
});
