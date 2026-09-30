import type { FoodMoment, MomentCategory } from './types';

export interface PersonalMealRotationCandidate {
  title: string;
  sourceMomentId: string;
}

const normalizeTitle = (value: string) =>
  value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase();

const isRealMoment = (moment: FoodMoment) => {
  const tags = moment.tags ?? [];
  return !tags.some((tag) => /^(demo|seed)$/i.test(tag.trim()));
};

const recency = (moment: FoodMoment) => {
  const dateTime = Date.parse(`${moment.date}T${moment.time || '00:00'}`);
  return Number.isFinite(dateTime) ? dateTime : moment.createdAt;
};

/**
 * Suggests one meal the user has genuinely eaten before when their three most
 * recent meals in a category are the same. It never invents food and never
 * mutates history; callers decide whether to surface/apply the candidate.
 */
export function derivePersonalMealRotation(
  moments: FoodMoment[],
  category: MomentCategory,
): PersonalMealRotationCandidate | null {
  const eligible = moments
    .filter((moment) => moment.category === category && isRealMoment(moment))
    .map((moment) => ({ moment, normalized: normalizeTitle(moment.title) }))
    .filter(({ normalized }) => normalized.length > 0)
    .sort((a, b) => recency(b.moment) - recency(a.moment));

  if (eligible.length < 4) return null;

  const recent = eligible.slice(0, 3);
  const repeatedTitle = recent[0].normalized;
  if (!recent.every(({ normalized }) => normalized === repeatedTitle)) return null;

  const alternative = eligible
    .slice(3)
    .find(({ normalized }) => normalized !== repeatedTitle);

  if (!alternative) return null;

  return {
    title: alternative.moment.title.trim(),
    sourceMomentId: alternative.moment.id,
  };
}
