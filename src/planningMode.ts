export type PlanningPattern = {
  kind: 'sleep' | 'meal' | 'energy';
  observation: string;
  confidence?: 'early' | 'growing' | 'strong';
};

export type PlanningInput = {
  event: string;
  eventTime?: string;
  patterns: PlanningPattern[];
  userChanges?: string[];
};

export type PlanningStep = {
  timing: 'before' | 'during' | 'after';
  text: string;
  basedOn?: PlanningPattern['kind'];
};

export type PersonalPlan = {
  title: string;
  steps: PlanningStep[];
  basis: string[];
  note: string;
};

const usefulKinds: PlanningPattern['kind'][] = ['sleep', 'meal', 'energy'];

export function createPersonalPlan(input: PlanningInput): PersonalPlan {
  const patterns = input.patterns.filter((pattern) => usefulKinds.includes(pattern.kind)).slice(0, 3);
  const changes = (input.userChanges ?? []).map((change) => change.trim()).filter(Boolean).slice(0, 2);
  const when = input.eventTime ? ` around ${input.eventTime}` : '';

  const steps: PlanningStep[] = [];
  for (const pattern of patterns) {
    if (pattern.kind === 'sleep') {
      steps.push({ timing: 'before', basedOn: 'sleep', text: 'Protect your usual sleep window the night before; avoid deliberately cutting it short for this event.' });
    }
    if (pattern.kind === 'meal') {
      steps.push({ timing: 'before', basedOn: 'meal', text: 'Keep a familiar meal or snack in your usual rhythm before the event rather than experimenting with a new routine.' });
    }
    if (pattern.kind === 'energy') {
      steps.push({ timing: 'before', basedOn: 'energy', text: 'Use your known higher-energy window for the demanding preparation, and keep the final lead-in lighter.' });
    }
  }

  if (steps.length === 0) {
    steps.push({ timing: 'before', text: 'Keep the hours before the event simple and close to your normal routine.' });
  }

  for (const change of changes) {
    steps.push({ timing: 'during', text: `Your adjustment: ${change}` });
  }

  return {
    title: `Plan for ${input.event}${when}`,
    steps: steps.slice(0, 4),
    basis: patterns.map((pattern) => pattern.observation),
    note: patterns.length
      ? 'This is a practical plan based on patterns you have observed, not a medical recommendation or a guarantee of an outcome.'
      : 'This is a simple provisional plan. As Moment learns your rhythm, it can make the plan more personal; it is not medical advice.',
  };
}
