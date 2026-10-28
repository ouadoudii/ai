import { describe, expect, it } from 'vitest';
import { evaluateNutritionAlarms } from '../src/utils/interventionEngine';
import type { DailyCheckIn, FoodMoment } from '../src/types';
import { getGuardianCopy } from '../src/utils/guardianLocalization';
import { getLocalDateKey } from '../src/utils/dateKey';

const sleepCheckIn = {
  id: 'sleep-2026-10-27',
  date: getLocalDateKey(),
  sleep: { durationHours: 5, wakeFeeling: 'exhausted', quality: 1 },
  wellbeing: { energyLevel: 4 },
} as unknown as DailyCheckIn;

const rushedMeal = {
  id: 'meal-1',
  date: getLocalDateKey(),
  title: 'كسكس',
  eatingPace: 'rushed',
  distraction: 'screen',
  time: '12:00',
  category: 'lunch',
  fullnessLevel: 3,
} as unknown as FoodMoment;

const lateMeal = {
  id: 'meal-2',
  date: getLocalDateKey(),
  title: 'طاجين',
  eatingPace: 'slow',
  distraction: 'none',
  time: '21:30',
  category: 'dinner',
  fullnessLevel: 5,
} as unknown as FoodMoment;

const allVisibleText = (alarm: ReturnType<typeof evaluateNutritionAlarms>['activeAlarms'][number]) =>
  [alarm.title, alarm.subtitle, alarm.reason, alarm.recommendation, alarm.actionableStep, alarm.timestamp].join(' ');

describe('guardian positive Arabic-first experience', () => {
  it('supports short sleep without unsupported hormone statistics or punitive advice', () => {
    const status = evaluateNutritionAlarms([], [sleepCheckIn]);
    expect(status.activeAlarms).toHaveLength(1);
    expect(status.activeAlarms[0].id).toBe('alarm-sleep-sleep-2026-10-27');
    expect(status.statusBadge).toBe('amber');
    expect(allVisibleText(status.activeAlarms[0])).toContain('الراحة');
    expect(allVisibleText(status.activeAlarms[0])).not.toMatch(/Ghrelin|Leptin|28%|⚠️|Kaffee|Heißhunger/);
  });

  it('uses the recorded wake feeling rather than inventing fatigue after short sleep', () => {
    const refreshed = {
      ...sleepCheckIn,
      id: 'sleep-refreshed',
      sleep: { durationHours: 5, wakeFeeling: 'refreshed' },
    } as unknown as DailyCheckIn;
    const status = evaluateNutritionAlarms([], [refreshed]);
    expect(status.activeAlarms).toHaveLength(1);
    expect(status.activeAlarms[0].subtitle).toContain('شعورك عند الاستيقاظ: منتعش');
    expect(status.activeAlarms[0].subtitle).toContain('سجّلت 5 ساعات نوم');
    expect(status.activeAlarms[0].subtitle).not.toMatch(/شعورك عند الاستيقاظ: تعب|undefined|NaN|تقييم جودة النوم/);
  });

  it('never fabricates sleep duration or wake feeling for a quality-only check-in', () => {
    const qualityOnly = {
      ...sleepCheckIn,
      id: 'sleep-quality-only',
      sleep: { quality: 1 },
    } as unknown as DailyCheckIn;
    const status = evaluateNutritionAlarms([], [qualityOnly]);
    expect(status.activeAlarms).toHaveLength(1);
    expect(status.activeAlarms[0].subtitle).toBe('تقييم جودة النوم: 1 من 5');
    expect(allVisibleText(status.activeAlarms[0])).not.toMatch(/undefined|NaN|سجّلت undefined|شعورك عند الاستيقاظ: تعب/);
  });

  it('respects a distracted meal without judging or restricting eating', () => {
    const status = evaluateNutritionAlarms([rushedMeal], []);
    expect(status.activeAlarms).toHaveLength(1);
    expect(status.activeAlarms[0].id).toBe('alarm-mindless-meal-1');
    expect(allVisibleText(status.activeAlarms[0])).toContain('كسكس');
    expect(allVisibleText(status.activeAlarms[0])).not.toMatch(/Überessen|stoppen|Nervus Vagus|⚠️/);
  });

  it('does not impose kitchen closing times after a late dinner', () => {
    const status = evaluateNutritionAlarms([lateMeal], []);
    const late = status.activeAlarms.find(alarm => alarm.triggerKey === 'circadian_late_food');
    expect(late).toBeDefined();
    expect(allVisibleText(late!)).toContain('طاجين');
    expect(allVisibleText(late!)).not.toMatch(/Küchenschluss|HGH|20:30|⚠️/);
  });

  it('uses supportive Arabic chrome even for high-severity internal signals', () => {
    const copy = getGuardianCopy('ar');
    expect(copy.title).toContain('للاهتمام بنفسك');
    expect(copy.activeAlarm(2)).toBe('أفكار يمكنك تجاهلها');
    expect(copy.done).toBe('إخفاء الفكرة');
    expect(copy.noIntervention).toBe('هنا متى احتجت');
    expect(copy.acute).not.toMatch(/إنذار|عقاب|فشل/);
  });
});
