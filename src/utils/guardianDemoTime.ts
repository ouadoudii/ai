export type GuardianDemoScenario = 'sleep' | 'rushed_meal' | 'afternoon_crash' | null;

/**
 * Keep each synthetic Guardian example scoped to the scenario the person chose.
 * Real journal evaluation always keeps the live clock.
 */
export const getGuardianEvaluationTime = (now: Date, scenario: GuardianDemoScenario): Date => {
  const evaluationTime = new Date(now);
  if (scenario === 'sleep') evaluationTime.setHours(9, 0, 0, 0);
  if (scenario === 'afternoon_crash') evaluationTime.setHours(15, 0, 0, 0);
  return evaluationTime;
};
