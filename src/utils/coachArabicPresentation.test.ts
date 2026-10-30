import { describe, expect, it } from 'vitest';
import {
  ARABIC_COACH_SUGGESTIONS,
  ARABIC_COACH_UNAVAILABLE,
  getArabicCoachFocus,
  getArabicCoachSummary,
  getArabicCoachWelcome,
  getArabicGoalCopy,
  formatObservedMealSignals,
} from './coachArabicPresentation';
import { INITIAL_COACHING_GOALS } from './coachEngine';

describe('Arabic-only coach presentation', () => {
  it('greets correctly in Arabic across morning, midday and evening', () => {
    expect(getArabicCoachWelcome(7)).toContain('صباح الخير');
    expect(getArabicCoachWelcome(13)).toContain('طاب نهارك');
    expect(getArabicCoachWelcome(21)).toContain('مساء الخير');
    expect(getArabicCoachWelcome(7)).not.toMatch(/Guten|Coach/);
  });

  it('keeps evidence-based summaries Arabic in every metric branch', () => {
    const good = { satietyBalanceScore: 90, satietyObservations: 2, screenFreeRatio: 90, screenFreeObservations: 2 };
    const lowSatiety = { satietyBalanceScore: 60, satietyObservations: 2, screenFreeRatio: 90, screenFreeObservations: 2 };
    const highScreen = { satietyBalanceScore: 90, satietyObservations: 2, screenFreeRatio: 30, screenFreeObservations: 2 };
    for (const message of [
      getArabicCoachSummary(good, false),
      getArabicCoachSummary(good, true),
      getArabicCoachSummary(lowSatiety, true),
      getArabicCoachSummary(highScreen, true),
      getArabicCoachFocus(false).title,
      getArabicCoachFocus(false).tip,
      getArabicCoachFocus(true).title,
      getArabicCoachFocus(true).tip,
    ]) {
      expect(message).toMatch(/[\u0600-\u06FF]/);
      expect(message).not.toMatch(/[A-Za-zÄÖÜäöüß]/);
    }
    expect(getArabicCoachSummary(lowSatiety, true)).not.toBe(getArabicCoachSummary(highScreen, true));
  });

  it('renders unknown body signals honestly, preserving explicitly reported zero', () => {
    expect(formatObservedMealSignals({})).toBe('الجوع: لم يُسجّل • الشبع: لم يُسجّل');
    expect(formatObservedMealSignals({ hungerLevel: 0, fullnessLevel: 5 })).toBe('الجوع: 0/5 • الشبع: 5/5');
    expect(getArabicCoachSummary({ satietyBalanceScore: 0, satietyObservations: 0, screenFreeRatio: 0, screenFreeObservations: 0 }, true))
      .toContain('دون أي ضغط');
  });

  it('localizes all existing goals without mutating their stored model', () => {
    const before = JSON.stringify(INITIAL_COACHING_GOALS);
    for (const goal of INITIAL_COACHING_GOALS) {
      const copy = getArabicGoalCopy(goal);
      expect(copy.title).toMatch(/[\u0600-\u06FF]/);
      expect(copy.description).toMatch(/[\u0600-\u06FF]/);
      expect(copy.unit).toMatch(/[\u0600-\u06FF]/);
    }
    expect(JSON.stringify(INITIAL_COACHING_GOALS)).toBe(before);
  });

  it('preserves unknown user-defined goal copy and offers Arabic chat actions and errors', () => {
    const custom = { ...INITIAL_COACHING_GOALS[0], id: 'custom', title: 'My goal', description: 'My note' };
    expect(getArabicGoalCopy(custom).title).toBe('My goal');
    expect(ARABIC_COACH_SUGGESTIONS).toHaveLength(4);
    for (const suggestion of ARABIC_COACH_SUGGESTIONS) expect(suggestion).toMatch(/[\u0600-\u06FF]/);
    expect(ARABIC_COACH_UNAVAILABLE).toMatch(/[\u0600-\u06FF]/);
  });
});
