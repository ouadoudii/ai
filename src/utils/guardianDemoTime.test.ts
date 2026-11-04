import { describe, expect, it } from 'vitest';
import { getGuardianEvaluationTime } from './guardianDemoTime';

describe('Guardian demo evaluation time', () => {
  const liveAfternoon = new Date('2026-11-04T15:30:00');

  it('keeps the sleep example in the morning so it cannot add an afternoon-energy alarm', () => {
    const result = getGuardianEvaluationTime(liveAfternoon, 'sleep');
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(0);
  });

  it('keeps the afternoon example in its intended window', () => {
    expect(getGuardianEvaluationTime(liveAfternoon, 'afternoon_crash').getHours()).toBe(15);
  });

  it('preserves the live clock for real journal data', () => {
    expect(getGuardianEvaluationTime(liveAfternoon, null).getTime()).toBe(liveAfternoon.getTime());
  });
});
