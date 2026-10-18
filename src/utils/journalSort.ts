import type { FoodMoment } from '../types';

export type JournalSortOrder = 'newest' | 'oldest';

const timeValue = (time: string | undefined): number | null => {
  if (!time || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const categoryTimeValue: Record<FoodMoment['category'], number> = {
  breakfast: 8 * 60,
  coffee: 10 * 60,
  travel: 12 * 60,
  lunch: 13 * 60,
  snack: 16 * 60,
  dessert: 19 * 60,
  dinner: 20 * 60,
  drinks: 21 * 60,
};

export const sortJournalMoments = (
  moments: FoodMoment[],
  order: JournalSortOrder = 'newest',
): FoodMoment[] => {
  const direction = order === 'oldest' ? 1 : -1;
  return [...moments].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare * direction;
    const aTime = timeValue(a.time) ?? categoryTimeValue[a.category];
    const bTime = timeValue(b.time) ?? categoryTimeValue[b.category];
    if (aTime !== bTime) return (aTime - bTime) * direction;
    if (a.createdAt !== b.createdAt) return (a.createdAt - b.createdAt) * direction;
    return a.id.localeCompare(b.id) * direction;
  });
};
