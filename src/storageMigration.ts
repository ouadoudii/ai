import type { DailyCheckIn, FoodMoment } from './types';
import { linkLegacyCheckInMeals } from './utils/legacyCheckInMealLinks';

const MOMENTS_KEY = 'nimmapp_moments_v1';
const CHECKINS_KEY = 'nimmapp_checkins_v1';
const MIGRATION_KEY = 'cary_storage_schema_v3';

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function validMoment(value: unknown): boolean {
  if (!isObject(value)) return false;
  return typeof value.id === 'string' && typeof value.title === 'string' && typeof value.date === 'string' && typeof value.time === 'string';
}

function validCheckIn(value: unknown): boolean {
  if (!isObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.date !== 'string' || typeof value.time !== 'string') return false;
  if (!['morning', 'midday', 'evening'].includes(String(value.timeOfDay))) return false;
  // DailyCheckIn wellbeing fields are intentionally optional: voice-only and other
  // partial check-ins are legitimate persisted history and must survive startup.
  return isObject(value.wellbeing);
}

function sanitizeArrayStorage(key: string, validator: (value: unknown) => boolean) {
  const raw = localStorage.getItem(key);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(key);
      return;
    }
    const valid = parsed.filter(validator);
    if (valid.length !== parsed.length) {
      if (valid.length) localStorage.setItem(key, JSON.stringify(valid));
      else localStorage.removeItem(key);
    }
  } catch {
    localStorage.removeItem(key);
  }
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

    if (localStorage.getItem(MIGRATION_KEY) === 'done') return;
    linkPersistedLegacyCheckInMeals();
    localStorage.removeItem('food_journey_moments_v1');
    localStorage.removeItem('getyourcoach_checkins_v1');
    localStorage.setItem(MIGRATION_KEY, 'done');
  } catch {
    // Storage may be blocked by the browser. Cary can still run with preset data.
  }
}
