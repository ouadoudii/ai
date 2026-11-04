import { describe, expect, it } from 'vitest';
import type { DailyCheckIn, FoodMoment } from '../types';
import { scopeGuardianEvaluationInputs, selectGuardianAcknowledgements } from './guardianDemoIsolation';

const personalMeal = { id: 'private-meal', title: 'وجبة شخصية' } as FoodMoment;
const demoMeal = { id: 'sim-rushed-1', title: 'حريرة تجريبية' } as FoodMoment;
const personalCheckIn = { id: 'private-sleep' } as DailyCheckIn;
const demoCheckIn = { id: 'sim-sleep-1' } as DailyCheckIn;

describe('Guardian demonstration privacy and truthful examples', () => {
  it('keeps real journal references unchanged when the demonstration is off', () => {
    const meals = [personalMeal];
    const checkIns = [personalCheckIn];
    const selected = scopeGuardianEvaluationInputs(null, meals, checkIns, [demoMeal], [demoCheckIn]);
    expect(selected.moments).toBe(meals);
    expect(selected.checkIns).toBe(checkIns);
  });

  it.each(['sleep', 'rushed_meal', 'afternoon_crash'] as const)(
    'never mixes personal journal records into the %s demonstration',
    (scenario) => {
      const meals = [personalMeal];
      const checkIns = [personalCheckIn];
      const demoMeals = scenario === 'rushed_meal' ? [demoMeal] : [];
      const demoCheckIns = scenario === 'rushed_meal' ? [] : [demoCheckIn];
      const selected = scopeGuardianEvaluationInputs(scenario, meals, checkIns, demoMeals, demoCheckIns);
      expect(selected.moments).toEqual(demoMeals);
      expect(selected.checkIns).toEqual(demoCheckIns);
      expect(selected.moments).not.toContain(personalMeal);
      expect(selected.checkIns).not.toContain(personalCheckIn);
      expect(meals).toEqual([personalMeal]);
      expect(checkIns).toEqual([personalCheckIn]);
    },
  );
});

describe('Guardian acknowledgement separation', () => {
  it('keeps personal dismissals active in normal mode and ignores demo dismissals', () => {
    const personal = ['real-sleep'];
    const demo = ['sim-sleep'];
    expect(selectGuardianAcknowledgements(false, personal, demo)).toBe(personal);
    expect(selectGuardianAcknowledgements(false, personal, demo)).not.toContain('sim-sleep');
  });

  it('does not let a personal dismissal suppress a demo even when occurrence IDs collide', () => {
    // Imported records can reuse IDs. Privacy must depend on mode, not ID uniqueness.
    const personal = ['shared-occurrence'];
    const demo: string[] = [];
    expect(selectGuardianAcknowledgements(true, personal, demo)).not.toContain('shared-occurrence');

    demo.push('shared-occurrence');
    expect(selectGuardianAcknowledgements(true, personal, demo)).toContain('shared-occurrence');
    expect(selectGuardianAcknowledgements(false, personal, demo)).toBe(personal);

    demo.length = 0; // Reset only the synthetic session, not the personal dismissal.
    expect(selectGuardianAcknowledgements(false, personal, demo)).toContain('shared-occurrence');
    expect(selectGuardianAcknowledgements(true, personal, demo)).toEqual([]);
    expect(personal).toEqual(['shared-occurrence']);
  });

  it('uses only temporary demo dismissals during simulation without changing personal state', () => {
    const personal = ['real-sleep'];
    const demo = ['sim-sleep'];
    expect(selectGuardianAcknowledgements(true, personal, demo)).toBe(demo);
    expect(selectGuardianAcknowledgements(true, personal, demo)).not.toContain('real-sleep');
    expect(personal).toEqual(['real-sleep']);
  });
});
