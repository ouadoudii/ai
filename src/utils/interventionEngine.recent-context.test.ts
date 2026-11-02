import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DailyCheckIn, FoodMoment } from '../types';
import { getLocalDateKey } from './dateKey';
import { evaluateNutritionAlarms } from './interventionEngine';

const moment = (date: string, id = 'meal-1'): FoodMoment => ({
  id, title: 'حريرة Harira', label: 'عشاء', category: 'dinner',
  date, time: '12:30', location: 'الرباط', locationCategory: 'home',
  imageUrl: '', mood: 'comfort', tags: ['Darija'], createdAt: Date.now(),
  eatingPace: 'rushed', distraction: 'screen', fullnessLevel: 2,
});
const checkIn = (date: string, id = 'checkin-1'): DailyCheckIn => ({
  id, date, time: '08:00', timeOfDay: 'morning',
  sleep: { durationHours: 5, quality: 2, wakeFeeling: 'exhausted' },
  wellbeing: { energyLevel: 1 }, createdAt: Date.now(),
});

describe('Guardian local-day context and gentle Arabic suggestions', () => {
  afterEach(() => vi.useRealTimers());

  it('uses a calm Arabic meal label for untitled imports while preserving real mixed-script titles', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T15:00:00'));
    const today = getLocalDateKey();
    for (const title of ['', '   ', undefined, null, { unexpected: true }, 'حريرة 7rira']) {
      const imported = { ...moment(today, 'imported-meal'), title: title as string };
      const original = JSON.stringify(imported);
      const result = evaluateNutritionAlarms([imported], []);
      const suggestion = result.activeAlarms.find(a => a.triggerKey === 'distracted_meal');
      expect(suggestion).toBeDefined();
      expect(suggestion?.subtitle).toBe(title === 'حريرة 7rira'
        ? 'تناولت «حريرة 7rira» بينما كان انتباهك مشغولًا'
        : 'تناولت وجبتك بينما كان انتباهك مشغولًا');
      expect(suggestion?.subtitle).not.toMatch(/undefined|null|\\[object Object\\]|«\\s*»|فشل|عقاب|إنذار/);
      expect(JSON.stringify(imported)).toBe(original);
    }
  });

  it('does not turn old or future entries into alarms about today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T14:00:00'));
    const result = evaluateNutritionAlarms(
      [moment('2026-09-01'), moment('2026-10-29', 'future-meal')],
      [checkIn('2026-09-01'), checkIn('2026-10-29', 'future-checkin')],
    );
    expect(result.activeAlarms).toEqual([]);
    expect(result.statusText).toContain('بلطف');
    expect(result.statusBadge).toBe('green');
  });


  it('does not prompt for future-clock entries from today, but preserves explicit demos', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T15:00:00'));
    const today = getLocalDateKey();
    const pastMeal = {
      ...moment(today, 'past-calm'), time: '14:00',
      eatingPace: 'slow' as const, distraction: 'mindful' as const,
      energyAfter: 'neutral' as const,
    };
    const futureMeal = {
      ...moment(today, 'future-rushed'), time: '19:00',
      energyAfter: 'sluggish' as const,
    };
    const pastCheckIn = {
      ...checkIn(today, 'past-rested'), time: '08:00',
      sleep: { durationHours: 8, quality: 4, wakeFeeling: 'refreshed' as const },
      wellbeing: { energyLevel: 4 },
    };
    const futureCheckIn = {
      ...checkIn(today, 'future-tired'), time: '19:30',
      wellbeing: { energyLevel: 1 },
    };
    for (const meals of [[futureMeal, pastMeal], [pastMeal, futureMeal]]) {
      for (const checkins of [[futureCheckIn, pastCheckIn], [pastCheckIn, futureCheckIn]]) {
        const original = JSON.stringify({ meals, checkins });
        const result = evaluateNutritionAlarms(meals, checkins);
        expect(result.activeAlarms).toEqual([]);
        expect(result.statusText).toContain('بلطف');
        expect(JSON.stringify(result)).not.toMatch(/فشل|عقاب|إنذار|Ghrelin|28%/);
        expect(JSON.stringify({ meals, checkins })).toBe(original);
      }
    }
    const futureDemoMeal = [{ ...moment(today, 'sim-rushed-future'), time: '19:00' }];
    // A synthetic-looking ID alone is not permission to anticipate a future meal.
    expect(evaluateNutritionAlarms(futureDemoMeal, []).activeAlarms).toEqual([]);
    const example = evaluateNutritionAlarms(
      futureDemoMeal, [], 'intuitive_mindful', new Date(), true,
    );
    expect(example.activeAlarms.map(alarm => alarm.triggerKey)).toContain('distracted_meal');
  });

  it('includes the current local minute without anticipating the next minute', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T15:00:00'));
    const today = getLocalDateKey();
    const current = { ...moment(today, 'observed-now'), time: '15:00' };
    const future = { ...moment(today, 'not-yet-observed'), time: '15:01', createdAt: Date.now() + 60_000 };
    const result = evaluateNutritionAlarms([future, current], []);
    expect(result.activeAlarms.filter(alarm => alarm.triggerKey === 'distracted_meal')
      .map(alarm => alarm.id)).toEqual(['alarm-mindless-observed-now']);
    expect(result.activeAlarms[0].reason).not.toMatch(/فشل|عقاب|إنذار/);
  });

  it('uses current entries even when an older entry is first in storage', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T14:00:00'));
    const today = getLocalDateKey();
    const result = evaluateNutritionAlarms(
      [moment('2026-09-01', 'old-meal'), moment(today, 'today-meal')],
      [checkIn('2026-09-01', 'old-checkin'), checkIn(today, 'today-checkin')],
    );
    expect(result.activeAlarms.map(alarm => alarm.id)).toEqual(expect.arrayContaining([
      'alarm-sleep-today-checkin',
      'alarm-mindless-today-meal',
      'alarm-afternoon-crash-checkin-today-checkin',
    ]));
    expect(result.activeAlarms.every(alarm => !alarm.id.includes('old-'))).toBe(true);
    expect(result.activeAlarms.map(alarm => alarm.title).join(' ')).not.toMatch(/فشل|عقاب|كüchenschluss|Überessen/i);
  });

  it('keeps source occurrence IDs stable and accepts only explicit simulator markers', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T10:00:00'));
    const demoMoments = [moment('Heute', 'sim-rushed-1'), moment('Heute', 'real-old-legacy')];
    const demoCheckIns = [checkIn('Heute', 'sim-sleep-1'), checkIn('Heute', 'real-old-checkin')];
    expect(evaluateNutritionAlarms(demoMoments, demoCheckIns).activeAlarms).toEqual([]);
    const simulated = evaluateNutritionAlarms(
      demoMoments, demoCheckIns, 'intuitive_mindful', new Date(), true,
    );
    expect(simulated.activeAlarms.map(alarm => alarm.id)).toEqual([
      'alarm-sleep-sim-sleep-1',
      'alarm-mindless-sim-rushed-1',
    ]);
    expect(evaluateNutritionAlarms([moment('Heute', 'real-old-legacy')], []).activeAlarms).toEqual([]);
  });

  it('honors a corrected rested sleep report even when history is unsorted', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T10:00:00'));
    const today = getLocalDateKey();
    const earlier = { ...checkIn(today, 'sleep-earlier'), time: '08:00', createdAt: 100 };
    const corrected = {
      ...checkIn(today, 'sleep-corrected'), time: '09:00', createdAt: 200,
      sleep: { durationHours: 8, quality: 4, wakeFeeling: 'refreshed' as const },
      wellbeing: undefined,
    };
    for (const history of [[earlier, corrected], [corrected, earlier]]) {
      const result = evaluateNutritionAlarms([], history);
      expect(result.activeAlarms.filter(a => a.triggerKey === 'sleep_deficit')).toEqual([]);
      expect(result.statusText).toContain('بلطف');
      expect(result.statusText).not.toMatch(/فشل|عقاب|إنذار/);
    }
  });

  it('keeps the latest genuinely tired sleep report, ignoring later partial entries', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T10:00:00'));
    const today = getLocalDateKey();
    const rested = {
      ...checkIn(today, 'sleep-rested'), time: '07:00', createdAt: 100,
      sleep: { durationHours: 8, quality: 4, wakeFeeling: 'refreshed' as const },
    };
    const tired = { ...checkIn(today, 'sleep-tired'), time: '09:00', createdAt: 200 };
    const unrelated = {
      ...checkIn(today, 'midday-no-sleep'), time: '10:00', createdAt: 300,
      sleep: undefined,
    };
    const result = evaluateNutritionAlarms([], [rested, unrelated, tired]);
    const sleep = result.activeAlarms.filter(a => a.triggerKey === 'sleep_deficit');
    expect(sleep).toHaveLength(1);
    expect(sleep[0].id).toBe('alarm-sleep-sleep-tired');
    expect(sleep[0].subtitle).toContain('مرهق');
    expect(sleep[0].title).not.toMatch(/فشل|عقاب|إنذار/);
  });

  it('uses the latest actual meal, not the first stored meal, for gentle distraction guidance', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T15:00:00'));
    const today = getLocalDateKey();
    const rushed = { ...moment(today, 'earlier-rushed'), time: '12:00', createdAt: 300 };
    const calm = {
      ...moment(today, 'later-calm'), time: '14:00', createdAt: 100,
      eatingPace: 'slow' as const, distraction: 'mindful' as const,
      energyAfter: 'neutral' as const,
    };
    const original = [rushed, calm];
    for (const history of [original, [...original].reverse()]) {
      const result = evaluateNutritionAlarms(history, []);
      expect(result.activeAlarms.some(a => a.triggerKey === 'distracted_meal')).toBe(false);
      expect(result.statusText).toContain('بلطف');
      expect(result.statusText).not.toMatch(/فشل|عقاب|إنذار|Überessen/);
    }
    expect(original.map(entry => entry.id)).toEqual(['earlier-rushed', 'later-calm']);
  });

  it('still offers optional guidance when the latest meal was distracted, even if history is unsorted', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T15:00:00'));
    const today = getLocalDateKey();
    const earlier = {
      ...moment(today, 'earlier-calm'), time: '12:00', createdAt: 300,
      eatingPace: 'slow' as const, distraction: 'mindful' as const,
    };
    const later = { ...moment(today, 'later-rushed'), time: '14:00', createdAt: 100 };
    const result = evaluateNutritionAlarms([earlier, later], []);
    const suggestions = result.activeAlarms.filter(a => a.triggerKey === 'distracted_meal');
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].id).toBe('alarm-mindless-later-rushed');
    expect(suggestions[0].title).toBe('لحظة هدوء بعد وجبتك');
    expect(suggestions[0].reason).not.toMatch(/فشل|عقاب|إنذار/);
  });

  it('does not judge an evening family meal by its time or fullness', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T22:15:00'));
    const today = getLocalDateKey();
    const dinner = {
      ...moment(today, 'family-couscous'), title: 'كسكس مع العائلة',
      category: 'dinner' as const, time: '21:30', fullnessLevel: 5,
      eatingPace: 'slow' as const, distraction: 'mindful' as const,
      energyAfter: 'neutral' as const,
    };
    const history = [dinner];
    const result = evaluateNutritionAlarms(history, []);
    expect(result.activeAlarms).toEqual([]);
    expect(result.hasAlarms).toBe(false);
    expect(result.statusBadge).toBe('green');
    expect(result.statusText).toContain('بلطف');
    expect(result.statusText).not.toMatch(/فشل|عقاب|إنذار|كُفّ|Überessen|Küchenschluss/);
    expect(history).toEqual([dinner]);
  });

  it('keeps optional, non-shaming care for a rushed evening meal without timing judgments', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T22:15:00'));
    const today = getLocalDateKey();
    const dinner = { ...moment(today, 'rushed-dinner'), time: '21:30', fullnessLevel: 5 };
    const result = evaluateNutritionAlarms([dinner], []);
    expect(result.activeAlarms.map(a => a.triggerKey)).toEqual(['distracted_meal']);
    expect(result.activeAlarms[0].title).toBe('لحظة هدوء بعد وجبتك');
    expect(result.activeAlarms[0].reason).not.toMatch(/فشل|عقاب|إنذار|Überessen|Küchenschluss/);
    expect(result.statusBadge).toBe('amber');
  });

  it('keeps real evening guidance quiet while an explicit afternoon demo remains informative', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T21:15:00'));
    const today = getLocalDateKey();
    const observation = {
      ...checkIn(today, 'energy-evening'),
      sleep: undefined,
      wellbeing: { energyLevel: 1, stressLevel: 2 },
    };
    const real = evaluateNutritionAlarms([], [observation]);
    expect(real.activeAlarms.some(alarm => alarm.triggerKey === 'afternoon_crash')).toBe(false);

    // A synthetic demonstration can explain the afternoon flow at night.
    // The explicit clock is scoped to this evaluation and never moves Date.now().
    const exampleTime = new Date('2026-10-28T15:00:00');
    const demo = evaluateNutritionAlarms([], [observation], 'intuitive_mindful', exampleTime);
    expect(demo.activeAlarms.map(alarm => alarm.triggerKey)).toContain('afternoon_crash');
    expect(demo.activeAlarms[0].title).toBe('مساحة صغيرة لاستعادة نشاطك');
    expect(demo.activeAlarms[0].reason).not.toMatch(/فشل|عقاب|إنذار|Ghrelin|28%/);
    expect(new Date().getHours()).toBe(21);
    expect(observation.date).toBe(today);
  });

  it('does not mistake a low-energy entry from another day for an afternoon prompt', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T15:00:00'));
    const result = evaluateNutritionAlarms([], [checkIn('2026-10-27', 'yesterday')]);
    expect(result.activeAlarms).toEqual([]);
  });
  it('ignores an impossible imported meal clock after a later calm meal', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T15:00:00'));
    const today = getLocalDateKey();
    const imported = { ...moment(today, 'invalid-rushed'), time: '99:99', createdAt: 300 };
    const calm = {
      ...moment(today, 'valid-calm'), time: '14:00', createdAt: 100,
      eatingPace: 'slow' as const, distraction: 'mindful' as const,
    };
    for (const history of [[imported, calm], [calm, imported]]) {
      const before = history.map(entry => entry.id);
      const result = evaluateNutritionAlarms(history, []);
      expect(result.activeAlarms.some(alarm => alarm.triggerKey === 'distracted_meal')).toBe(false);
      expect(result.statusText).toContain('بلطف');
      expect(history.map(entry => entry.id)).toEqual(before);
    }
  });

  it('hides malformed meal timestamps and honors later energy recovery', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T15:00:00'));
    const today = getLocalDateKey();
    const imported = {
      ...moment(today, 'malformed-clock'), time: '99:99',
      energyAfter: 'sluggish' as const, createdAt: 100,
    };
    const recovered = {
      ...checkIn(today, 'energy-recovered'), time: '14:30', createdAt: 200,
      sleep: undefined, wellbeing: { energyLevel: 4 },
    };
    const result = evaluateNutritionAlarms([imported], [recovered]);
    expect(result.activeAlarms.some(alarm => alarm.triggerKey === 'afternoon_crash')).toBe(false);
    expect(result.activeAlarms.find(alarm => alarm.triggerKey === 'distracted_meal')?.timestamp).toBe('منذ قليل');
    expect(JSON.stringify(result)).not.toMatch(/99:99|فشل|عقاب|إنذار|Ghrelin|28%/);
  });



  it('keeps the latest valid sleep observation when a newer import is entirely corrupt', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T10:00:00'));
    const today = getLocalDateKey();
    const earlier = {
      ...checkIn(today, 'usable-sleep'), time: '07:30', createdAt: 100,
      wellbeing: undefined,
    };
    const corrupt = {
      ...checkIn(today, 'corrupt-sleep'), time: '08:30', createdAt: 200,
      sleep: { durationHours: -3, quality: 99, wakeFeeling: 'unknown' } as unknown as DailyCheckIn['sleep'],
      wellbeing: undefined,
    };
    for (const history of [[earlier, corrupt], [corrupt, earlier]]) {
      const before = JSON.stringify(history);
      const result = evaluateNutritionAlarms([], history);
      const sleep = result.activeAlarms.filter(a => a.triggerKey === 'sleep_deficit');
      expect(sleep).toHaveLength(1);
      expect(sleep[0].id).toBe('alarm-sleep-usable-sleep');
      expect(sleep[0].subtitle).toContain('سجّلت 5 ساعات نوم');
      expect(JSON.stringify(result)).not.toMatch(/-3 ساعات|99 من 5|undefined|NaN|فشل|عقاب|إنذار/);
      expect(JSON.stringify(history)).toBe(before);
    }
  });

  it('does not resurrect an old sleep concern when a newer import is corrupt', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T10:00:00'));
    const today = getLocalDateKey();
    const rested = {
      ...checkIn(today, 'rested'), time: '07:30', createdAt: 100,
      sleep: { durationHours: 8, quality: 4, wakeFeeling: 'refreshed' as const },
      wellbeing: undefined,
    };
    const corrupt = {
      ...checkIn(today, 'corrupt'), time: '08:30', createdAt: 200,
      sleep: { durationHours: 28, quality: 99, wakeFeeling: 'unknown' } as unknown as DailyCheckIn['sleep'],
      wellbeing: undefined,
    };
    expect(evaluateNutritionAlarms([], [corrupt, rested]).activeAlarms
      .filter(a => a.triggerKey === 'sleep_deficit')).toEqual([]);
  });

  it('respects a later valid wake feeling even when its other sleep fields are corrupt', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T10:00:00'));
    const today = getLocalDateKey();
    const tired = {
      ...checkIn(today, 'tired'), time: '07:30', createdAt: 100, wellbeing: undefined,
    };
    const refreshed = {
      ...checkIn(today, 'refreshed'), time: '08:30', createdAt: 200,
      sleep: { durationHours: -3, quality: 99, wakeFeeling: 'refreshed' as const },
      wellbeing: undefined,
    };
    expect(evaluateNutritionAlarms([], [tired, refreshed]).activeAlarms
      .filter(a => a.triggerKey === 'sleep_deficit')).toEqual([]);
  });

  it('does not invent a sleep concern from impossible imported sleep metrics', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T10:00:00'));
    const today = getLocalDateKey();
    for (const [hours, quality] of [[-3, 99], [28, 0], [Number.POSITIVE_INFINITY, -1]]) {
      const imported = {
        ...checkIn(today, 'invalid-sleep'),
        sleep: { durationHours: hours, quality, wakeFeeling: 'unknown' } as unknown as DailyCheckIn['sleep'],
        wellbeing: undefined,
      };
      const before = JSON.stringify(imported);
      const result = evaluateNutritionAlarms([], [imported]);
      expect(result.activeAlarms.filter(alarm => alarm.triggerKey === 'sleep_deficit')).toEqual([]);
      expect(result.statusText).toContain('بلطف');
      expect(JSON.stringify(result)).not.toMatch(/-3|28 ساعات|99 من 5|undefined|NaN|فشل|عقاب|Ghrelin|28%/);
      expect(JSON.stringify(imported)).toBe(before);
    }
  });

  it('keeps gentle sleep guidance when a valid feeling accompanies corrupted metrics', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T10:00:00'));
    const today = getLocalDateKey();
    const imported = {
      ...checkIn(today, 'mixed-sleep'),
      sleep: { durationHours: -3, quality: 99, wakeFeeling: 'exhausted' as const },
      wellbeing: undefined,
    };
    const result = evaluateNutritionAlarms([], [imported]);
    const sleep = result.activeAlarms.filter(alarm => alarm.triggerKey === 'sleep_deficit');
    expect(sleep).toHaveLength(1);
    expect(sleep[0].subtitle).toContain('شعورك عند الاستيقاظ: مرهق');
    expect(sleep[0].subtitle).not.toMatch(/-3|99|undefined|NaN/);
    expect(sleep[0].reason).not.toMatch(/فشل|عقاب|إنذار/);
  });

  it('uses a valid sleep quality observation without echoing an impossible duration', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T10:00:00'));
    const today = getLocalDateKey();
    const imported = {
      ...checkIn(today, 'quality-only'),
      sleep: { durationHours: 28, quality: 2, wakeFeeling: 'unknown' } as unknown as DailyCheckIn['sleep'],
      wellbeing: undefined,
    };
    const result = evaluateNutritionAlarms([], [imported]);
    const sleep = result.activeAlarms.filter(alarm => alarm.triggerKey === 'sleep_deficit');
    expect(sleep).toHaveLength(1);
    expect(sleep[0].subtitle).toContain('تقييم جودة النوم: 2 من 5');
    expect(sleep[0].subtitle).not.toMatch(/28|undefined|NaN|شعورك عند الاستيقاظ/);
    expect(sleep[0].recommendation).not.toMatch(/فشل|عقاب|إنذار/);
  });

  it('ignores impossible imported energy scores instead of inventing afternoon concerns', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T15:00:00'));
    const today = getLocalDateKey();
    for (const energyLevel of [-3, 0, 2.5, 99, Number.POSITIVE_INFINITY, Number.NaN]) {
      const imported = {
        ...checkIn(today, 'invalid-energy'),
        sleep: undefined,
        wellbeing: { energyLevel },
      };
      const result = evaluateNutritionAlarms([], [imported]);
      expect(result.activeAlarms.filter(alarm => alarm.triggerKey === 'afternoon_crash')).toEqual([]);
      expect(result.statusText).toContain('بلطف');
      expect(result.statusBadge).toBe('green');
      expect(imported.wellbeing.energyLevel).toBe(energyLevel);
    }
  });

  it('uses the latest valid energy report, not a newer corrupted import', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T15:00:00'));
    const today = getLocalDateKey();
    const low = {
      ...checkIn(today, 'valid-low-energy'), time: '14:00', createdAt: 100,
      sleep: undefined, wellbeing: { energyLevel: 1 },
    };
    const invalid = {
      ...checkIn(today, 'invalid-later-energy'), time: '14:30', createdAt: 200,
      sleep: undefined, wellbeing: { energyLevel: 99 },
    };
    const recovered = {
      ...checkIn(today, 'valid-recovered-energy'), time: '14:45', createdAt: 300,
      sleep: undefined, wellbeing: { energyLevel: 4 },
    };
    for (const history of [[low, invalid], [invalid, low]]) {
      const result = evaluateNutritionAlarms([], history);
      const energy = result.activeAlarms.filter(alarm => alarm.triggerKey === 'afternoon_crash');
      expect(energy).toHaveLength(1);
      expect(energy[0].id).toBe('alarm-afternoon-crash-checkin-valid-low-energy');
      expect(energy[0].reason).not.toMatch(/فشل|عقاب|إنذار|Ghrelin|28%/);
      expect(evaluateNutritionAlarms([], [...history, recovered]).activeAlarms
        .filter(alarm => alarm.triggerKey === 'afternoon_crash')).toEqual([]);
    }
  });

  it('uses observed clock time over backfill order for sleep and energy recovery', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T15:00:00'));
    const today = getLocalDateKey();
    const earlierSleep = {
      ...checkIn(today, 'backfilled-short-sleep'), time: '07:00', createdAt: 900,
      wellbeing: undefined,
    };
    const restedLater = {
      ...checkIn(today, 'rested-later'), time: '08:30', createdAt: 100,
      sleep: { durationHours: 8, quality: 4, wakeFeeling: 'refreshed' as const },
      wellbeing: undefined,
    };
    const earlierEnergy = {
      ...checkIn(today, 'backfilled-low-energy'), time: '14:00', createdAt: 800,
      sleep: undefined, wellbeing: { energyLevel: 1 },
    };
    const recoveredLater = {
      ...checkIn(today, 'energy-recovered-later'), time: '14:30', createdAt: 200,
      sleep: undefined, wellbeing: { energyLevel: 4 },
    };
    for (const history of [
      [earlierSleep, restedLater, earlierEnergy, recoveredLater],
      [recoveredLater, earlierEnergy, restedLater, earlierSleep],
    ]) {
      const before = JSON.stringify(history);
      const status = evaluateNutritionAlarms([], history);
      expect(status.activeAlarms).toEqual([]);
      expect(status.statusText).toContain('بلطف');
      expect(JSON.stringify(status)).not.toMatch(/فشل|عقاب|إنذار|Ghrelin|28%/);
      expect(JSON.stringify(history)).toBe(before);
    }
  });

  it('does not let a malformed imported clock outrank a later valid sleep correction', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T10:00:00'));
    const today = getLocalDateKey();
    const corruptClock = {
      ...checkIn(today, 'corrupt-clock'), time: '99:99', createdAt: 900,
    };
    const rested = {
      ...checkIn(today, 'rested'), time: '08:30', createdAt: 100,
      sleep: { durationHours: 8, quality: 4, wakeFeeling: 'refreshed' as const },
      wellbeing: undefined,
    };
    const result = evaluateNutritionAlarms([], [corruptClock, rested]);
    expect(result.activeAlarms.filter(alarm => alarm.triggerKey === 'sleep_deficit')).toEqual([]);
    expect(result.statusText).toContain('بلطف');
  });


  it('still offers a gentle prompt when a later clock observation reports low energy', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T15:00:00'));
    const today = getLocalDateKey();
    const earlierRecovered = {
      ...checkIn(today, 'earlier-energy'), time: '14:00', createdAt: 900,
      sleep: undefined, wellbeing: { energyLevel: 4 },
    };
    const laterLow = {
      ...checkIn(today, 'later-low-energy'), time: '14:30', createdAt: 100,
      sleep: undefined, wellbeing: { energyLevel: 2 },
    };
    const result = evaluateNutritionAlarms([], [earlierRecovered, laterLow]);
    expect(result.activeAlarms.map(alarm => alarm.id))
      .toContain('alarm-afternoon-crash-checkin-later-low-energy');
    expect(result.activeAlarms[0].title).toBe('مساحة صغيرة لاستعادة نشاطك');
    expect(result.activeAlarms[0].reason).not.toMatch(/فشل|عقاب|إنذار/);
  });

  it('respects a later steady meal report after a low-energy check-in without inventing recovery', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T15:00:00'));
    const today = getLocalDateKey();
    const low = {
      ...checkIn(today, 'energy-low-before-lunch'), time: '14:00', createdAt: 900,
      sleep: undefined, wellbeing: { energyLevel: 1 },
    };
    const steady = {
      ...moment(today, 'energy-steady-after-lunch'), time: '14:30', createdAt: 100,
      eatingPace: 'slow' as const, distraction: 'mindful' as const,
      energyAfter: 'neutral' as const,
    };
    const before = JSON.stringify([low, steady]);
    for (const energyAfter of ['neutral', 'energized'] as const) {
      const result = evaluateNutritionAlarms([{ ...steady, energyAfter }], [low]);
      expect(result.activeAlarms.filter(a => a.triggerKey === 'afternoon_crash')).toEqual([]);
      expect(result.statusText).toContain('بلطف');
      expect(JSON.stringify(result)).not.toMatch(/فشل|عقاب|إنذار|Ghrelin|28%/);
    }
    // An earlier steady meal does not override a later low-energy check-in.
    const earlierMeal = { ...steady, time: '13:30', createdAt: 1000 };
    expect(evaluateNutritionAlarms([earlierMeal], [low]).activeAlarms
      .map(a => a.id)).toContain('alarm-afternoon-crash-checkin-energy-low-before-lunch');
    // Unknown and malformed meal reports cannot silently claim recovery.
    for (const untrusted of [
      { ...steady, energyAfter: undefined },
      { ...steady, time: '99:99' },
      { ...steady, time: 99 as unknown as string },
    ]) {
      expect(evaluateNutritionAlarms([untrusted], [low]).activeAlarms
        .map(a => a.id)).toContain('alarm-afternoon-crash-checkin-energy-low-before-lunch');
    }
    expect(JSON.stringify([low, steady])).toBe(before);
  });

});