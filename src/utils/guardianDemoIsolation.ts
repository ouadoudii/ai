import type { DailyCheckIn, FoodMoment } from '../types';

export type GuardianDemoScenario = 'sleep' | 'rushed_meal' | 'afternoon_crash' | null;

/**
 * Demo suggestions are examples, not personal observations.
 * Never combine synthetic entries with a person's real journal during evaluation.
 */
export function scopeGuardianEvaluationInputs(
  scenario: GuardianDemoScenario,
  personalMoments: FoodMoment[],
  personalCheckIns: DailyCheckIn[],
  demoMoments: FoodMoment[],
  demoCheckIns: DailyCheckIn[],
): { moments: FoodMoment[]; checkIns: DailyCheckIn[] } {
  if (scenario === null) {
    return { moments: personalMoments, checkIns: personalCheckIns };
  }
  return { moments: demoMoments, checkIns: demoCheckIns };
}
