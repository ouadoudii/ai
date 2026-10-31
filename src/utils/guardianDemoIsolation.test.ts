import { describe, expect, it } from 'vitest';
import type { DailyCheckIn, FoodMoment } from '../types';
import { scopeGuardianEvaluationInputs } from './guardianDemoIsolation';

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
