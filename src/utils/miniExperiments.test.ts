import { describe, expect, it } from 'vitest';
import { evaluateMiniExperiment, suggestMiniExperiment, updateExperimentStatus } from './miniExperiments';

describe('personal mini experiments', () => {
  it('suggests a short measurable experiment from an observed personal pattern', () => {
    const experiment = suggestMiniExperiment({ lateLunchEveningSnackPattern: true });
    expect(experiment).toMatchObject({
      durationDays: 3,
      status: 'suggested',
      measure: expect.stringContaining('evening'),
    });
    expect(experiment?.hypothesis).toMatch(/may be associated/i);
    expect(experiment?.hypothesis).not.toMatch(/causes?|will prevent|guarantee/i);
  });

  it('does not invent an experiment without a personal pattern', () => {
    expect(suggestMiniExperiment({})).toBeNull();
  });

  it('allows a suggested experiment to be declined or aborted', () => {
    const experiment = suggestMiniExperiment({ breakfastEnergyPattern: true });
    expect(experiment).not.toBeNull();
    expect(updateExperimentStatus(experiment!, 'declined').status).toBe('declined');
    expect(updateExperimentStatus(experiment!, 'aborted').status).toBe('aborted');
  });

  it('reports too little data until three usable planned days exist', () => {
    expect(evaluateMiniExperiment([
      { followedPlan: true, outcome: 1 },
      { followedPlan: true, outcome: 1 },
      { followedPlan: false, outcome: 1 },
    ])).toBe('not_enough_data');
  });

  it('distinguishes likely help from no clear effect without claiming causality', () => {
    expect(evaluateMiniExperiment([
      { followedPlan: true, outcome: 1 },
      { followedPlan: true, outcome: 1 },
      { followedPlan: true, outcome: 0 },
    ])).toBe('likely_helped');

    expect(evaluateMiniExperiment([
      { followedPlan: true, outcome: 1 },
      { followedPlan: true, outcome: 0 },
      { followedPlan: true, outcome: 0 },
    ])).toBe('no_clear_effect');
  });
});
