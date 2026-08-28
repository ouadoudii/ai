const MOMENTS_KEY = 'nimmapp_moments_v1';
const CHECKINS_KEY = 'nimmapp_checkins_v1';
const MIGRATION_KEY = 'cary_storage_schema_v2';

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
  if (!isObject(value.wellbeing)) return false;
  return typeof value.wellbeing.energyLevel === 'number' && typeof value.wellbeing.mood === 'string';
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

export function migrateLegacyStorage() {
  try {
    if (localStorage.getItem(MIGRATION_KEY) === 'done') return;
    sanitizeArrayStorage(MOMENTS_KEY, validMoment);
    sanitizeArrayStorage(CHECKINS_KEY, validCheckIn);
    localStorage.removeItem('food_journey_moments_v1');
    localStorage.removeItem('getyourcoach_checkins_v1');
    localStorage.setItem(MIGRATION_KEY, 'done');
  } catch {
    // Storage may be blocked by the browser. Cary can still run with preset data.
  }
}
