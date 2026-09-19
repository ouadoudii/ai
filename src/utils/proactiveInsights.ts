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
const MIN_LATE_MEAL_SLEEP_SAMPLES = 3;
const MIN_BASELINE_SLEEP_SAMPLES = 3;
const MIN_SLEEP_DIFFERENCE_HOURS = 0.75;
const dateTime = (entry: DailyCheckIn) => Date.parse(`${entry.date}T${entry.time || '12:00'}:00`);
const sleep = (entry: DailyCheckIn) => entry.sleep?.durationHours;
const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

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
    const recurring = [...byWeekday.entries()].find(([, values]) => values.length >= 3 && average(values) <= 2.5);
    if (recurring) {
      const [weekday, values] = recurring;
      const id = `energy-pattern:${weekday}`;
      if (eligible(id)) result.push({ id, kind: 'energy-pattern', reason: `Low energy recurred on ${values.length} recorded ${new Intl.DateTimeFormat('en', { weekday: 'long' }).format(new Date(2026, 0, 4 + weekday))}s.`, evidenceDays: values.length });
    }
  }

  const sorted = [...checkIns].sort((a, b) => dateTime(a) - dateTime(b));
  const lateMealSleep: number[] = [];
  const baselineSleep: number[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const entry = sorted[i];
    const next = sorted[i + 1];
    if (sleep(next) == null) continue;
    const nextDay = new Date(`${entry.date}T12:00:00`).getTime() + DAY === new Date(`${next.date}T12:00:00`).getTime();
    if (!nextDay) continue;
    const isLateMeal = Boolean(entry.food) && Number(entry.time.slice(0, 2)) >= 21;
    if (isLateMeal) lateMealSleep.push(sleep(next)!);
    else if (!entry.food || Number(entry.time.slice(0, 2)) < 21) baselineSleep.push(sleep(next)!);
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
