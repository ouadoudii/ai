import { describe, expect, it } from 'vitest';
import { PHASE_START_HOUR, isPhaseAvailable } from './utils/phaseAvailability';

const phases = ['morning', 'midday', 'evening'] as const;

describe('personal plan phase availability contract', () => {
  it.each(phases)('%s stays unavailable until its shared start hour', phase => {
    const start = PHASE_START_HOUR[phase];
    expect(isPhaseAvailable(phase, start - 1)).toBe(false);
    expect(isPhaseAvailable(phase, start)).toBe(true);
  });

  it('keeps midday and evening aligned with Today boundaries', () => {
    expect(isPhaseAvailable('midday', 10)).toBe(false);
    expect(isPhaseAvailable('midday', 11)).toBe(true);
    expect(isPhaseAvailable('evening', 16)).toBe(false);
    expect(isPhaseAvailable('evening', 17)).toBe(false);
    expect(isPhaseAvailable('evening', 18)).toBe(true);
  });
});
