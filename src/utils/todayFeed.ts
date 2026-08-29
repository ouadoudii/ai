import { FoodMoment } from '../types';

export function getRecentTodayMoments(
  moments: FoodMoment[],
  todayKey: string,
  limit = 3,
): FoodMoment[] {
  return moments
    .filter((moment) => moment.date === todayKey)
    .sort((a, b) => {
      if (b.createdAt !== a.createdAt) return b.createdAt - a.createdAt;
      return b.time.localeCompare(a.time);
    })
    .slice(0, Math.max(0, limit));
}
