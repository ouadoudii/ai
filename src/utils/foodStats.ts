import { FoodMoment } from '../types';

export type LocationStats = { home: number; restaurant: number; unknown: number };

export function getLocationStats(moments: FoodMoment[]): LocationStats {
  return moments.reduce<LocationStats>((counts, moment) => {
    const category = moment.locationCategory;
    if (category === 'home') counts.home += 1;
    else if (category === 'restaurant' || category === 'cafe') counts.restaurant += 1;
    else counts.unknown += 1;
    return counts;
  }, { home: 0, restaurant: 0, unknown: 0 });
}

export function getAverageRating(moments: FoodMoment[]): string {
  const ratings = moments
    .map((moment) => moment.rating)
    .filter((rating): rating is number => typeof rating === 'number' && Number.isFinite(rating));
  if (!ratings.length) return '0.0';
  return (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1);
}
