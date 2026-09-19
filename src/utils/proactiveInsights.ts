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
const dateTime = (entry: DailyCheckIn) => Date.parse(`${entry.date}T${entry.time || '12:00'}:00`);
const sleep = (entry: DailyCheckIn) => entry.sleep?.durationHours;

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
    const recurring = [...byWeekday.entries()].find(([, values]) => values.length >= 3 && values.reduce((a, b) => a + b, 0) / values.length <= 2.5);
    if (recurring) {
      const [weekday, values] = recurring;
      const id = `energy-pattern:${weekday}`;
      if (eligible(id)) result.push({ id, kind: 'energy-pattern', reason: `Low energy recurred on ${values.length} recorded ${new Intl.DateTimeFormat('en', { weekday: 'long' }).format(new Date(2026, 0, 4 + weekday))}s.`, evidenceDays: values.length });
    }
  }

  const sorted = [...checkIns].sort((a, b) => dateTime(a) - dateTime(b));
  let linkedDays = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    const meal = sorted[i];
    const next = sorted[i + 1];
    if (!meal.food || Number(meal.time.slice(0, 2)) < 21 || sleep(next) == null) continue;
    const nextDay = new Date(`${meal.date}T12:00:00`).getTime() + DAY === new Date(`${next.date}T12:00:00`).getTime();
    if (nextDay && sleep(next)! < 7) linkedDays += 1;
  }
  const lateMealId = 'late-meal-sleep';
  if (linkedDays >= 3 && eligible(lateMealId)) result.push({ id: lateMealId, kind: 'late-meal-sleep', reason: `On ${linkedDays} recorded occasions, a meal after 21:00 was followed by under 7 hours of sleep.`, evidenceDays: linkedDays });

  return result.slice(0, 1);
}

export function markInsightShown(history: ProactiveInsightHistory, id: string, shownAt = Date.now()): ProactiveInsightHistory {
  return { ...history, shownAt: { ...history.shownAt, [id]: shownAt } };
}

export function recordInsightFeedback(history: ProactiveInsightHistory, id: string, feedback: 'helpful' | 'not-helpful'): ProactiveInsightHistory {
  return { ...history, feedback: { ...history.feedback, [id]: feedback } };
}
