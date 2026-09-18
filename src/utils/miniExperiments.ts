export type ExperimentOutcome = 'likely_helped' | 'no_clear_effect' | 'not_enough_data';

export interface MiniExperiment {
  id: string;
  hypothesis: string;
  durationDays: number;
  action: string;
  measure: string;
  status: 'suggested' | 'active' | 'declined' | 'aborted' | 'completed';
}

export interface ExperimentObservation {
  followedPlan: boolean;
  outcome: number | null;
}

export interface ExperimentSuggestionContext {
  lateLunchEveningSnackPattern?: boolean;
  lateMealPoorSleepPattern?: boolean;
  breakfastEnergyPattern?: boolean;
}

/**
 * Suggests one small experiment only when an observed personal pattern gives it a reason.
 * Wording deliberately describes a hypothesis rather than a causal claim.
 */
export function suggestMiniExperiment(context: ExperimentSuggestionContext): MiniExperiment | null {
  if (context.lateLunchEveningSnackPattern) {
    return {
      id: 'earlier-lunch-evening-snack',
      hypothesis: 'Earlier lunch may be associated with less evening snacking for you.',
      durationDays: 3,
      action: 'Have lunch at least 60 minutes earlier than your recent usual time.',
      measure: 'Record whether you snack in the evening each day.',
      status: 'suggested',
    };
  }
  if (context.lateMealPoorSleepPattern) {
    return {
      id: 'earlier-dinner-sleep',
      hypothesis: 'An earlier last meal may be associated with better sleep for you.',
      durationDays: 3,
      action: 'Finish your last meal at least 60 minutes earlier than your recent usual time.',
      measure: 'Record next-morning sleep quality each day.',
      status: 'suggested',
    };
  }
  if (context.breakfastEnergyPattern) {
    return {
      id: 'breakfast-before-nine-energy',
      hypothesis: 'Breakfast before 09:00 may be associated with steadier afternoon energy for you.',
      durationDays: 3,
      action: 'Have breakfast before 09:00.',
      measure: 'Record afternoon energy each day.',
      status: 'suggested',
    };
  }
  return null;
}

export function updateExperimentStatus(
  experiment: MiniExperiment,
  status: 'active' | 'declined' | 'aborted',
): MiniExperiment {
  return { ...experiment, status };
}

/**
 * Conservative evaluation: at least three usable planned days are required. The result is an
 * observed association during the experiment, never proof that the action caused the outcome.
 */
export function evaluateMiniExperiment(
  observations: ExperimentObservation[],
  improvementThreshold = 0.6,
): ExperimentOutcome {
  const usable = observations.filter(
    (observation): observation is ExperimentObservation & { outcome: number } =>
      observation.followedPlan && typeof observation.outcome === 'number',
  );
  if (usable.length < 3) return 'not_enough_data';

  const improved = usable.filter((observation) => observation.outcome > 0).length / usable.length;
  return improved >= improvementThreshold ? 'likely_helped' : 'no_clear_effect';
}
