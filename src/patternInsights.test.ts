import { describe, expect, it } from 'vitest';
import { buildPatternInsights, confidenceForEvidence } from './utils/patternInsights';
import type { DailyCheckIn, FoodMoment } from './types';

describe('pattern insights', () => {
  it('uses cautious confidence labels', () => {
    expect(confidenceForEvidence(2)).toBe('Signal');
    expect(confidenceForEvidence(4)).toBe('Trend');
    expect(confidenceForEvidence(7)).toBe('Pattern');
  });

  it('ignores seeded demo data', () => {
    const moments = [{ id: 'moment-1', category: 'lunch', time: '15:00' }] as FoodMoment[];
    const result = buildPatternInsights(moments, []);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('learning');
    expect(result[0].evidenceCount).toBe(0);
  });

  it('detects repeated short-sleep and low-energy observations', () => {
    const checks = [
      { id: 'u1', date: '2026-08-28', timeOfDay: 'morning', sleep: { durationHours: 6 }, wellbeing: { energyLevel: 3 } },
      { id: 'u2', date: '2026-08-28', timeOfDay: 'midday', wellbeing: { energyLevel: 2 } },
      { id: 'u3', date: '2026-08-29', timeOfDay: 'morning', sleep: { durationHours: 6.5 }, wellbeing: { energyLevel: 3 } },
      { id: 'u4', date: '2026-08-29', timeOfDay: 'midday', wellbeing: { energyLevel: 1 } },
    ] as DailyCheckIn[];
    const result = buildPatternInsights([], checks);
    const sleepEnergy = result.find((item) => item.id === 'sleep-energy');
    expect(sleepEnergy).toBeTruthy();
    expect(sleepEnergy?.observation).toContain('2 of 2');
    expect(sleepEnergy?.confidence).toBe('Signal');
  });

  it('creates a lunch rhythm card after repeated real lunches', () => {
    const moments = [
      { id: 'a', category: 'lunch', time: '14:15' },
      { id: 'b', category: 'lunch', time: '14:30' },
      { id: 'c', category: 'lunch', time: '13:10' },
      { id: 'd', category: 'lunch', time: '14:05' },
    ] as FoodMoment[];
    const result = buildPatternInsights(moments, []);
    const rhythm = result.find((item) => item.id === 'lunch-rhythm');
    expect(rhythm?.observation).toContain('3 of 4');
    expect(rhythm?.confidence).toBe('Trend');
  });
});
