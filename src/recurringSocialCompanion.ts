import type { FoodMoment, MomentCategory } from './types';

export interface RecurringSocialCompanionInsight {
  companion: string;
  count: number;
  category: MomentCategory;
}

const normalize = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f\u064B-\u065F\u0670]/g, '')
  .trim()
  .replace(/\s+/g, ' ')
  .toLocaleLowerCase();

const isDemoMoment = (moment: FoodMoment) => {
  const marker = `${moment.id} ${(moment.tags ?? []).join(' ')}`.toLocaleLowerCase();
  return /(^|[\s_-])(demo|seed|sample|simulated)([\s_-]|$)/.test(marker);
};

/**
 * Finds one explicit recurring social companion for a meal category.
 * This is observation-only: it never infers relationships or mutates history.
 */
export function deriveRecurringSocialCompanion(
  moments: FoodMoment[],
  category: MomentCategory,
): RecurringSocialCompanionInsight | null {
  const candidates = moments
    .filter(moment => moment.category === category && !isDemoMoment(moment))
    .filter(moment => Boolean(moment.companions?.trim()))
    .sort((a, b) => b.createdAt - a.createdAt);

  const counts = new Map<string, { count: number; latest: string }>();
  for (const moment of candidates) {
    const exact = moment.companions!.trim();
    const key = normalize(exact);
    if (!key) continue;
    const current = counts.get(key);
    if (current) current.count += 1;
    else counts.set(key, { count: 1, latest: exact });
  }

  const ranked = [...counts.values()]
    .filter(item => item.count >= 3)
    .sort((a, b) => b.count - a.count);

  const first = ranked[0];
  if (!first) return null;
  if (ranked[1]?.count === first.count) return null;

  return { companion: first.latest, count: first.count, category };
}
