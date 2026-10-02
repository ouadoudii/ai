import type { FoodMoment } from '../types';

export type JournalSortOrder = 'newest' | 'oldest';

const timeValue = (time: string | undefined): number | null => {
  if (!time || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const sortJournalMoments = (
  moments: FoodMoment[],
  order: JournalSortOrder = 'newest',
): FoodMoment[] => {
  const direction = order === 'oldest' ? 1 : -1;
  return [...moments].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare * direction;

    const aTime = timeValue(a.time);
    const bTime = timeValue(b.time);
    if (aTime !== null && bTime !== null && aTime !== bTime) {
      return (aTime - bTime) * direction;
    }
    if (aTime !== null && bTime === null) return -1;
    if (aTime === null && bTime !== null) return 1;

    const createdCompare = a.createdAt - b.createdAt;
    if (createdCompare !== 0) return createdCompare * direction;
    return a.id.localeCompare(b.id) * direction;
  });
};
