export type MealCompanionHistoryEntry = {
  items: string[];
  isDemo?: boolean;
  createdAt?: string | number | Date;
};

const normalize = (value: string) =>
  value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase();

/**
 * Finds one recurring companion for the current user-authored meal item.
 * Only explicit item arrays are considered; callers should not pass inferred foods.
 */
export function suggestPersonalMealCompanion(
  currentItem: string,
  history: MealCompanionHistoryEntry[],
  minimumOccurrences = 3,
): string | null {
  const currentKey = normalize(currentItem);
  if (!currentKey || minimumOccurrences < 1) return null;

  const candidates = new Map<string, { count: number; latest: string; latestOrder: number }>();

  history.forEach((entry, entryIndex) => {
    if (entry.isDemo || !Array.isArray(entry.items)) return;
    const cleanItems = entry.items
      .map((item) => ({ raw: item.trim(), key: normalize(item) }))
      .filter((item) => item.raw && item.key);
    if (!cleanItems.some((item) => item.key === currentKey)) return;

    // Count a companion at most once per meal, even if the item was duplicated in input.
    const seen = new Set<string>();
    cleanItems.forEach((item) => {
      if (item.key === currentKey || seen.has(item.key)) return;
      seen.add(item.key);
      const previous = candidates.get(item.key);
      candidates.set(item.key, {
        count: (previous?.count ?? 0) + 1,
        latest: item.raw,
        latestOrder: entryIndex,
      });
    });
  });

  const eligible = [...candidates.values()]
    .filter((candidate) => candidate.count >= minimumOccurrences)
    .sort((a, b) => b.count - a.count || b.latestOrder - a.latestOrder);
  if (!eligible.length) return null;
  if (eligible[1]?.count === eligible[0].count) return null;
  return eligible[0].latest;
}
