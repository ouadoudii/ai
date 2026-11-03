import type { DailyCheckIn, FoodMoment } from './types';
import { linkLegacyCheckInMeals } from './utils/legacyCheckInMealLinks';

const MOMENTS_KEY = 'nimmapp_moments_v1';
const CHECKINS_KEY = 'nimmapp_checkins_v1';
const LEGACY_MOMENTS_KEY = 'food_journey_moments_v1';
const LEGACY_CHECKINS_KEY = 'getyourcoach_checkins_v1';
const MIGRATION_KEY = 'cary_storage_schema_v3';

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function validMoment(value: unknown): value is FoodMoment {
  if (!isObject(value)) return false;
  return typeof value.id === 'string' && typeof value.title === 'string' && typeof value.date === 'string' && typeof value.time === 'string';
}

function validCheckIn(value: unknown): value is DailyCheckIn {
  if (!isObject(value)) return false;
  // Legacy check-ins may lack a clock time or contain a malformed one.
  // Keep otherwise valid journal entries: downstream views treat unknown time as unknown.
  if (typeof value.id !== 'string' || typeof value.date !== 'string') return false;
  if (!['morning', 'midday', 'evening'].includes(String(value.timeOfDay))) return false;
  // A check-in can contain sleep, food or wellbeing independently. Reject empty
  // or malformed records, but never erase a legitimate sleep-only morning entry
  // just because its wellbeing section was intentionally left unanswered.
  return isObject(value.wellbeing) || isObject(value.sleep) || isObject(value.food);
}

function readValidatedArray<T>(keys: string[], validator: (value: unknown) => value is T): T[] {
  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) continue;
      return parsed.filter(validator);
    } catch {
      // Try the legacy fallback before giving up. App hydration must never trust
      // syntactically or structurally invalid persisted state.
    }
  }
  return [];
}

export function loadPersistedMoments(): FoodMoment[] {
  return readValidatedArray([MOMENTS_KEY, LEGACY_MOMENTS_KEY], validMoment);
}

export function loadPersistedCheckIns(): DailyCheckIn[] {
  return readValidatedArray([CHECKINS_KEY, LEGACY_CHECKINS_KEY], validCheckIn);
}

function sanitizeArrayStorage(key: string, validator: (value: unknown) => boolean) {
  const raw = localStorage.getItem(key);
  if (!raw) return;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    localStorage.removeItem(key);
    return;
  }
  if (!Array.isArray(parsed)) {
    localStorage.removeItem(key);
    return;
  }
  const valid = parsed.filter(validator);
  if (valid.length !== parsed.length) {
    // A failed write must never be mistaken for malformed JSON and delete history.
    if (valid.length) localStorage.setItem(key, JSON.stringify(valid));
    else localStorage.removeItem(key);
  }
}

function transferLegacyRecords<T extends { id: string }>(
  sourceKey: string, targetKey: string, validator: (value: unknown) => value is T,
) {
  const source = localStorage.getItem(sourceKey);
  if (source === null) return;
  const parsed: unknown = JSON.parse(source);
  // Retain unrecognized source data for recovery instead of silently discarding it.
  if (!Array.isArray(parsed) || !parsed.every(validator)) {
    throw new Error('Legacy history needs recovery');
  }
  const current = readValidatedArray([targetKey], validator);
  const knownIds = new Set(current.map(record => record.id));
  for (const record of parsed as T[]) {
    if (!knownIds.has(record.id)) {
      current.push(record);
      knownIds.add(record.id);
    }
  }
  const serialized = JSON.stringify(current);
  localStorage.setItem(targetKey, serialized);
  if (localStorage.getItem(targetKey) !== serialized) {
    throw new Error('Legacy history write could not be verified');
  }
  localStorage.removeItem(sourceKey);
}

function linkPersistedLegacyCheckInMeals() {
  const rawMoments = localStorage.getItem(MOMENTS_KEY);
  const rawCheckIns = localStorage.getItem(CHECKINS_KEY);
  if (!rawMoments || !rawCheckIns) return;
  const moments = JSON.parse(rawMoments) as FoodMoment[];
  const checkIns = JSON.parse(rawCheckIns) as DailyCheckIn[];
  const linked = linkLegacyCheckInMeals(moments, checkIns);
  if (linked !== moments) localStorage.setItem(MOMENTS_KEY, JSON.stringify(linked));
}

export function migrateLegacyStorage() {
  try {
    // Persisted state is untrusted input. Validate it on every startup, not only
    // during a one-time schema migration: browser extensions, interrupted writes,
    // older builds or manual storage edits can corrupt it after migration completed.
    sanitizeArrayStorage(MOMENTS_KEY, validMoment);
    sanitizeArrayStorage(CHECKINS_KEY, validCheckIn);

    transferLegacyRecords(LEGACY_MOMENTS_KEY, MOMENTS_KEY, validMoment);
    transferLegacyRecords(LEGACY_CHECKINS_KEY, CHECKINS_KEY, validCheckIn);
    if (localStorage.getItem(MIGRATION_KEY) === 'done') return;
    linkPersistedLegacyCheckInMeals();
    localStorage.setItem(MIGRATION_KEY, 'done');
  } catch {
    // Storage may be blocked by the browser. Cary can still run with preset data.
  }
}
