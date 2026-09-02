import { describe, expect, it } from 'vitest';
import { getEligibleJourneyPhases, getJourneyPhase, getNextJourneyStep } from './dailyJourney';

describe('daily journey', () => {
  it('maps the day into three simple phases', () => {
    expect(getJourneyPhase(7)).toBe('morning');
    expect(getJourneyPhase(12)).toBe('midday');
    expect(getJourneyPhase(20)).toBe('evening');
  });

  it('only asks for phases that have already become relevant', () => {
    expect(getEligibleJourneyPhases(8)).toEqual(['morning']);
    expect(getEligibleJourneyPhases(13)).toEqual(['morning', 'midday']);
    expect(getEligibleJourneyPhases(18)).toEqual(['morning', 'midday', 'evening']);
  });

  it('catches up a missed earlier phase before the current one', () => {
    const step = getNextJourneyStep(18, { morning: true, midday: false, evening: false });
    expect(step.phase).toBe('midday');
    expect(step.catchUp).toBe(true);
    expect(step.complete).toBe(false);
  });

  it('does not nag when all currently relevant phases are complete', () => {
    const step = getNextJourneyStep(13, { morning: true, midday: true, evening: false });
    expect(step.complete).toBe(true);
    expect(step.title).toContain('captured');
  });
});
