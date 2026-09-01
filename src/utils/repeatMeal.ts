import { FoodMoment } from '../types';
import { getLocalDateKey } from './dateKey';

const isDemoMoment = (moment: FoodMoment) => /^moment-\d{1,2}$/.test(moment.id);

export function getRepeatCandidates(moments: FoodMoment[], limit = 3): FoodMoment[] {
  const seen = new Set<string>();
  return [...moments]
    .filter((moment) => !isDemoMoment(moment))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .filter((moment) => {
      const key = `${moment.category}|${moment.title.trim().toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}

export function repeatMeal(moment: FoodMoment, now = new Date()): FoodMoment {
  const createdAt = now.getTime();
  return {
    ...moment,
    id: `moment-${createdAt}-${Math.random().toString(36).slice(2, 6)}`,
    date: getLocalDateKey(now),
    time: now.toTimeString().slice(0, 5),
    createdAt,
    isFavorite: moment.isFavorite || false,
    coachFeedback: undefined,
    notes: moment.notes,
    tags: Array.from(new Set([...(moment.tags || []), 'Wiederholt'])),
  };
}
