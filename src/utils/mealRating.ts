/**
 * Meal ratings are personal opinions, not inferred nutrition scores.
 * An omitted, null, non-finite or out-of-range value is not a rating.
 * Never backfill missing ratings: historical explicitly recorded values remain intact.
 */
export const hasExplicitMealRating = (rating: number | null | undefined): rating is number =>
  typeof rating === 'number' && Number.isFinite(rating) && rating >= 1 && rating <= 5;
