import { DailyCheckIn } from '../types';

export type ProactiveInsightKind = 'energy-pattern' | 'late-meal-sleep';

export interface ProactiveInsight {
  id: string;
  kind: ProactiveInsightKind;
  reason: string;
  evidenceDays: number;
}

export interface ProactiveInsightHistory {
  shownAt?: Record<string, number>;
  feedback?: Record<string, 'helpful' | 'not-helpful'>;
}

const DAY = 24 * 60 * 60 * 1000;
const COOLDOWN = 7 * DAY;
const MIN_ENERGY_BASELINE_SAMPLES = 3;
const MIN_ENERGY_DIFFERENCE = 0.75;
const MIN_LATE_MEAL_SLEEP_SAMPLES = 3;
const MIN_BASELINE_SLEEP_SAMPLES = 3;
const MIN_SLEEP_DIFFERENCE_HOURS = 0.75;
const sleep = (entry: DailyCheckIn) => entry.sleep?.durationHours;
const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
const nextDate = (date: string) => {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + 1);
  return value.toISOString().slice(0, 10);
};

/** Personal-data-only insight candidates. No generic wellness reminders are emitted. */
export function deriveProactiveInsights(
  checkIns: DailyCheckIn[],
  history: ProactiveInsightHistory = {},
  now = Date.now(),
): ProactiveInsight[] {
  const eligible = (id: string) => {
    if (history.feedback?.[id] === 'not-helpful') return false;
    const lastShown = history.shownAt?.[id];
    return lastShown == null || now - lastShown >= COOLDOWN;
  };

  const result: ProactiveInsight[] = [];
  const energy = checkIns.filter(entry => entry.wellbeing.energyLevel != null);
  if (energy.length >= 6) {
    const byWeekday = new Map<number, number[]>();
    for (const entry of energy) {
      const weekday = new Date(`${entry.date}T12:00:00`).getDay();
      const values = byWeekday.get(weekday) ?? [];
      values.push(entry.wellbeing.energyLevel!);
      byWeekday.set(weekday, values);
    }
    const recurring = [...byWeekday.entries()].find(([weekday, values]) => {
      if (values.length < 3 || average(values) > 2.5) return false;
      const baseline = energy
        .filter(entry => new Date(`${entry.date}T12:00:00`).getDay() !== weekday)
        .map(entry => entry.wellbeing.energyLevel!);
      return baseline.length >= MIN_ENERGY_BASELINE_SAMPLES && average(baseline) - average(values) >= MIN_ENERGY_DIFFERENCE;
    });
    if (recurring) {
      const [weekday, values] = recurring;
      const id = `energy-pattern:${weekday}`;
      if (eligible(id)) result.push({ id, kind: 'energy-pattern', reason: `Low energy recurred on ${values.length} recorded ${new Intl.DateTimeFormat('en', { weekday: 'long' }).format(new Date(2026, 0, 4 + weekday))}s.`, evidenceDays: values.length });
    }
  }

  // Link meals to sleep by calendar day, not event adjacency. A wellbeing or other
  // check-in between dinner and next morning must not make real evidence disappear.
  const sleepByDate = new Map<string, number>();
  for (const entry of checkIns) {
    const duration = sleep(entry);
    if (duration != null && !sleepByDate.has(entry.date)) sleepByDate.set(entry.date, duration);
  }

  const mealByDate = new Map<string, DailyCheckIn>();
  for (const entry of checkIns) {
    if (!entry.food) continue;
    const current = mealByDate.get(entry.date);
    if (!current || entry.time > current.time) mealByDate.set(entry.date, entry);
  }

  const lateMealSleep: number[] = [];
  const baselineSleep: number[] = [];
  for (const [date, meal] of mealByDate) {
    const nextDaySleep = sleepByDate.get(nextDate(date));
    if (nextDaySleep == null) continue;
    const hour = Number(meal.time.slice(0, 2));
    if (hour >= 21) lateMealSleep.push(nextDaySleep);
    else baselineSleep.push(nextDaySleep);
  }

  const lateMealId = 'late-meal-sleep';
  if (
    lateMealSleep.length >= MIN_LATE_MEAL_SLEEP_SAMPLES &&
    baselineSleep.length >= MIN_BASELINE_SLEEP_SAMPLES &&
    average(baselineSleep) - average(lateMealSleep) >= MIN_SLEEP_DIFFERENCE_HOURS &&
    eligible(lateMealId)
  ) {
    result.push({
      id: lateMealId,
      kind: 'late-meal-sleep',
      reason: `Across ${lateMealSleep.length} recorded late-meal nights, sleep averaged meaningfully shorter than on ${baselineSleep.length} comparison nights.`,
      evidenceDays: lateMealSleep.length,
    });
  }

  return result.slice(0, 1);
}

export function markInsightShown(history: ProactiveInsightHistory, id: string, shownAt = Date.now()): ProactiveInsightHistory {
  return { ...history, shownAt: { ...history.shownAt, [id]: shownAt } };
}

export function recordInsightFeedback(history: ProactiveInsightHistory, id: string, feedback: 'helpful' | 'not-helpful'): ProactiveInsightHistory {
  return { ...history, feedback: { ...history.feedback, [id]: feedback } };
}