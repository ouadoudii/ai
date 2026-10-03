import type { FoodMoment } from '../types';

export interface RecurringMealInsight {
  title: string;
  count: number;
  latestCreatedAt: number;
}

const isDemoMoment = (moment: FoodMoment) => /^moment-\d{1,2}$/.test(moment.id);
const mealKey = (title: string) => title.trim().replace(/\s+/g, ' ').toLocaleLowerCase();

export function getRecurringMeals(moments: FoodMoment[], limit = 3): RecurringMealInsight[] {
  const groups = new Map<string, RecurringMealInsight>();

  moments.forEach((moment) => {
    if (isDemoMoment(moment) || !moment.title.trim()) return;
    const key = mealKey(moment.title);
    const createdAt = moment.createdAt || 0;
    const current = groups.get(key);
    if (!current) {
      groups.set(key, { title: moment.title.trim(), count: 1, latestCreatedAt: createdAt });
      return;
    }
    current.count += 1;
    if (createdAt >= current.latestCreatedAt) {
      current.title = moment.title.trim();
      current.latestCreatedAt = createdAt;
    }
  });

  return [...groups.values()]
    .filter((meal) => meal.count >= 2)
    .sort((a, b) => b.count - a.count || b.latestCreatedAt - a.latestCreatedAt || a.title.localeCompare(b.title))
    .slice(0, Math.max(0, limit));
}
