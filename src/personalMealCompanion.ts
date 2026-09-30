export type MealCompanionHistoryEntry = {
  items?: string[] | null;
  isDemo?: boolean;
  source?: 'user' | 'demo' | 'seed' | string;
};

export type MealCompanionSuggestion = {
  value: string;
  coOccurrences: number;
};

const normalize = (value: string) =>
  value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase();

/**
 * Learns one optional companion from explicit, real user meal history.
 * It deliberately returns nothing for sparse or tied evidence so callers
 * never need to guess or mutate a draft automatically.
 */
export function derivePersonalMealCompanion(
  currentItem: string,
  history: MealCompanionHistoryEntry[],
  minimumCoOccurrences = 3,
): MealCompanionSuggestion | null {
  const current = normalize(currentItem);
  if (!current || minimumCoOccurrences < 1) return null;

  const counts = new Map<string, { count: number; latest: string; order: number }>();
  let order = 0;

  for (const entry of history) {
    if (entry.isDemo || entry.source === 'demo' || entry.source === 'seed') continue;
    const rawItems = (entry.items ?? []).filter((item): item is string => typeof item === 'string');
    const items = rawItems
      .map((raw) => ({ raw: raw.trim(), key: normalize(raw) }))
      .filter(({ raw, key }) => raw.length > 0 && key.length > 0);

    if (!items.some(({ key }) => key === current)) continue;

    // Count each companion at most once per meal, even if extraction duplicated it.
    const companions = new Map<string, string>();
    for (const item of items) {
      if (item.key !== current) companions.set(item.key, item.raw);
    }

    for (const [key, latest] of companions) {
      const previous = counts.get(key);
      counts.set(key, { count: (previous?.count ?? 0) + 1, latest, order: order++ });
    }
  }

  const eligible = [...counts.values()].filter(({ count }) => count >= minimumCoOccurrences);
  if (!eligible.length) return null;
  const bestCount = Math.max(...eligible.map(({ count }) => count));
  const winners = eligible.filter(({ count }) => count === bestCount);
  if (winners.length !== 1) return null;

  return { value: winners[0].latest, coOccurrences: winners[0].count };
}
