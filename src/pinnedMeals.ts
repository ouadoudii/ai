import type { FoodMoment } from './types';

export const MAX_PINNED_MEALS = 5;
export const PINNED_MEALS_STORAGE_KEY = 'moment_pinned_meals_v1';
export const PINNED_MEALS_CHANGED_EVENT = 'moment:pinned-meals-changed';

const normalize = (value: string) => value.trim().normalize('NFKC').toLocaleLowerCase();

export function isPinnableMeal(moment: FoodMoment): boolean {
  if (!moment.title?.trim()) return false;
  const id = normalize(String(moment.id ?? ''));
  const tags = (moment.tags ?? []).map(normalize);
  return !id.includes('demo') && !id.includes('seed') && !id.includes('sample') && !tags.some(tag => ['demo', 'seed', 'sample'].includes(tag));
}

export function derivePinnedMeals(moments: FoodMoment[], pinnedIds: string[], limit = MAX_PINNED_MEALS): FoodMoment[] {
  const byId = new Map(moments.filter(isPinnableMeal).map(moment => [String(moment.id), moment]));
  const seenMeals = new Set<string>();
  const result: FoodMoment[] = [];

  for (const id of pinnedIds) {
    const moment = byId.get(String(id));
    if (!moment) continue;
    const identity = `${moment.category}:${normalize(moment.title)}`;
    if (seenMeals.has(identity)) continue;
    seenMeals.add(identity);
    result.push(moment);
    if (result.length >= limit) break;
  }
  return result;
}

export function togglePinnedMealId(pinnedIds: string[], moment: FoodMoment, limit = MAX_PINNED_MEALS): string[] {
  if (!isPinnableMeal(moment)) return pinnedIds;
  const id = String(moment.id);
  if (pinnedIds.includes(id)) return pinnedIds.filter(current => current !== id);
  return [id, ...pinnedIds.filter(current => current !== id)].slice(0, limit);
}

export function readPinnedMealIds(storage: Pick<Storage, 'getItem'> = localStorage): string[] {
  try {
    const parsed = JSON.parse(storage.getItem(PINNED_MEALS_STORAGE_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string').slice(0, MAX_PINNED_MEALS);
  } catch {
    return [];
  }
}

export function writePinnedMealIds(ids: string[], storage: Pick<Storage, 'setItem'> = localStorage): string[] {
  const safeIds = Array.from(new Set(ids.filter(id => typeof id === 'string' && id.trim()))).slice(0, MAX_PINNED_MEALS);
  storage.setItem(PINNED_MEALS_STORAGE_KEY, JSON.stringify(safeIds));
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(PINNED_MEALS_CHANGED_EVENT, { detail: safeIds }));
  return safeIds;
}