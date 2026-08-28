import { describe, expect, it } from 'vitest';
import type { FoodMoment, DailyCheckIn } from '../types';
import { analyzeNutritionType } from './nutritionTypeEngine';
import { calculateCoachingMetrics, generateMomentCoachFeedback } from './coachEngine';
import { evaluateNutritionAlarms } from './interventionEngine';

const baseMoment = (overrides: Partial<FoodMoment> = {}): FoodMoment => ({
  id: 'm1', title: 'Test meal', label: 'Lunch', category: 'lunch', date: '2026-08-28', time: '12:30',
  location: 'Home', locationCategory: 'home', imageUrl: '', rating: 4, mood: 'satisfied', tags: [], createdAt: 1,
  ...overrides,
});

describe('nutrition type engine', () => {
  it('detects a protein performer from repeated protein-rich meals', () => {
    const moments = [1,2,3].map(i => baseMoment({ id: `p${i}`, nutrition: { protein: 35 } }));
    expect(analyzeNutritionType(moments).archetype).toBe('protein_performer');
  });
  it('keeps the profile locked until enough data exists', () => {
    expect(analyzeNutritionType([baseMoment()]).unlocked).toBe(false);
  });
});

describe('coach engine', () => {
  it('returns feedback for a mindful meal', () => {
    const feedback = generateMomentCoachFeedback(baseMoment({ eatingPace: 'slow', distraction: 'mindful', fullnessLevel: 3 }));
    expect(feedback.title.length).toBeGreaterThan(0);
    expect(feedback.message.length).toBeGreaterThan(0);
  });
  it('calculates coaching metrics without NaN values', () => {
    const metrics = calculateCoachingMetrics([baseMoment(), baseMoment({ id: 'm2', rating: 5 })]);
    for (const value of Object.values(metrics)) if (typeof value === 'number') expect(Number.isFinite(value)).toBe(true);
  });
});

describe('guardian intervention engine', () => {
  it('raises a sleep-deficit alarm', () => {
    const checkIn: DailyCheckIn = {
      id: 'c1', date: '2026-08-28', time: '08:00', timeOfDay: 'morning',
      sleep: { durationHours: 5, quality: 2, wakeFeeling: 'tired' },
      wellbeing: { energyLevel: 2, mood: 'comfort', stressLevel: 3 }, createdAt: 1,
    };
    const result = evaluateNutritionAlarms([], [checkIn]);
    expect(result.hasAlarms).toBe(true);
    expect(result.activeAlarms.some(a => a.triggerKey === 'sleep_deficit')).toBe(true);
  });
});
