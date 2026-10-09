import type { FoodMoment, MomentCategory } from '../types';

export interface PersonalLocationSuggestion {
  location: string;
  observations: number;
}

const normalizeLocation = (value: string) =>
  value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase();

const isDemoLike = (moment: FoodMoment) => {
  const id = moment.id.toLocaleLowerCase();
  return id.startsWith('demo') || id.startsWith('seed') || id.startsWith('sample');
};

/**
 * Returns one location only when the user's real history provides a clear,
 * repeated winner. Comparison is normalized, while display text remains the
 * latest exact spelling the user stored.
 */
export function derivePersonalFrequentLocation(
  moments: FoodMoment[],
  category: MomentCategory,
  minimumObservations = 3,
): PersonalLocationSuggestion | null {
  const candidates = moments
    .filter((moment) => moment.category === category && !isDemoLike(moment))
    .map((moment) => ({ moment, key: normalizeLocation(moment.location ?? '') }))
    .filter(({ key }) => key.length > 0);

  const counts = new Map<string, number>();
  for (const { key } of candidates) counts.set(key, (counts.get(key) ?? 0) + 1);

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (!ranked.length || ranked[0][1] < minimumObservations) return null;
  if (ranked[1]?.[1] === ranked[0][1]) return null;

  const [winner, observations] = ranked[0];
  const latest = [...candidates]
    .filter(({ key }) => key === winner)
    .sort((a, b) => b.moment.createdAt - a.moment.createdAt)[0]?.moment.location;

  return latest ? { location: latest, observations } : null;
}
