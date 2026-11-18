import { describe, expect, it } from 'vitest';
import type { FoodMoment } from '../types';
import { calculateCoachingMetrics, deriveDailyCoachingGoals, generateMomentCoachFeedback } from './coachEngine';

const meal = (fields: Partial<FoodMoment> = {}): FoodMoment => ({
  id: 'observed-1', title: 'نص tajine ديال الدجاج بلا زيت', label: 'غداء',
  category: 'lunch', date: '2026-10-30', time: '13:00', location: 'الدار',
  locationCategory: 'home', imageUrl: '', mood: 'satisfied', tags: [], createdAt: 1,
  ...fields,
});

describe('Coach uses only explicitly reported body signals (#486)', () => {
  it('never invents satiety, mindfulness, pace or a score for title-only meals', () => {
    const recorded = meal();
    const before = JSON.stringify(recorded);
    const metrics = calculateCoachingMetrics([recorded], '2026-10-30');
    expect(metrics.todayMomentsCount).toBe(1);
    expect(metrics.satietyObservations).toBe(0);
    expect(metrics.satietyBalanceScore).toBe(0);
    expect(metrics.screenFreeObservations).toBe(0);
    expect(metrics.screenFreeRatio).toBe(0);
    expect(metrics.mindfulScore).toBe(0);
    expect(metrics.slowEatingRatio).toBe(0);
    const feedback = generateMomentCoachFeedback(recorded);
    expect(feedback.message).toContain('دون أي ضغط');
    expect(feedback.habitScore).toBeUndefined();
    expect(feedback.message).not.toMatch(/Überessen|Sättigungs-Signal|Schuld|فشل|عقاب/);
    expect(JSON.stringify(recorded)).toBe(before);
  });

  it('counts only observed satiety without grading eating experiences or missing fields', () => {
    const metrics = calculateCoachingMetrics([
      meal({ id: 'unknown' }),
      meal({ id: 'reported', fullnessLevel: 5, distraction: 'screen', eatingPace: 'rushed' }),
    ], '2026-10-30');
    expect(metrics.satietyObservations).toBe(1);
    expect(metrics.satietyBalanceScore).toBe(0);
    expect(metrics.screenFreeObservations).toBe(1);
    expect(metrics.screenFreeRatio).toBe(0);
    expect(metrics.mindfulScore).toBe(0);
    expect(metrics.coachSummary).not.toMatch(/فشل|عقاب|سيئ|Überessen|50%|88%/);
    expect(metrics.slowEatingRatio).toBe(0);
  });

  it('recognizes every explicitly recorded fullness level without labeling a body signal wrong', () => {
    const moments = [
      meal({ id: 'low', fullnessLevel: 1 }),
      meal({ id: 'high', fullnessLevel: 5 }),
      meal({ id: 'neutral', fullnessLevel: 3 }),
      meal({ id: 'unknown' }),
    ];
    const goals = deriveDailyCoachingGoals(moments, '2026-10-30');
    const fullnessGoal = goals.find(goal => goal.id === 'goal-3');
    expect(fullnessGoal?.current).toBe(3);
    expect(fullnessGoal?.completed).toBe(true);
    expect(fullnessGoal?.description).toContain('دون تقييم أو ضغط');
    expect(calculateCoachingMetrics(moments, '2026-10-30').satietyObservations).toBe(3);
    expect(deriveDailyCoachingGoals(moments, '2026-10-31').find(goal => goal.id === 'goal-3')?.current).toBe(0);
  });

  it('preserves explicit zero and does not praise unknown energy or pace', () => {
    const recorded = meal({ hungerLevel: 0, fullnessLevel: 0, nutrition: { protein: 30 } });
    const feedback = generateMomentCoachFeedback(recorded);
    expect(feedback.habitScore).toBeUndefined();
    expect(feedback.message).not.toContain('طاقة');
    const metrics = calculateCoachingMetrics([recorded], '2026-10-30');
    expect(metrics.satietyObservations).toBe(1);
    expect(metrics.satietyBalanceScore).toBe(0);
  });
});
