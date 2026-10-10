import type { FoodMoment } from './types';

export interface RecurringMealMemory {
  key: string;
  displayTitle: string;
  occurrenceCount: number;
  lastSeenAt: number;
}

export function mealIdentityKey(title: string): string {
  return title
    .normalize('NFKC')
    .trim()
    .replace(/^[\p{P}\p{S}\s]+|[\p{P}\p{S}\s]+$/gu, '')
    .replace(/[\p{P}\p{S}\s]+/gu, ' ')
    .toLocaleLowerCase();
}

function isDemoMoment(moment: FoodMoment): boolean {
  const tags = moment.tags.map((tag) => tag.toLocaleLowerCase());
  return tags.some((tag) => tag === 'demo' || tag === 'seed' || tag === 'sample');
}

export function deriveRecurringMealMemory(moments: FoodMoment[]): RecurringMealMemory[] {
  const groups = new Map<string, FoodMoment[]>();

  for (const moment of moments) {
    if (isDemoMoment(moment)) continue;
    const key = mealIdentityKey(moment.title);
    if (!key) continue;
    const group = groups.get(key) ?? [];
    group.push(moment);
    groups.set(key, group);
  }

  return [...groups.entries()]
    .filter(([, group]) => group.length >= 2)
    .map(([key, group]) => {
      const newest = [...group].sort((a, b) => b.createdAt - a.createdAt)[0];
      return {
        key,
        displayTitle: newest.title,
        occurrenceCount: group.length,
        lastSeenAt: newest.createdAt,
      };
    })
    .sort((a, b) => b.lastSeenAt - a.lastSeenAt);
}
