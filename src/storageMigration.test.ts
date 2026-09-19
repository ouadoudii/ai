import { beforeEach, describe, expect, it, vi } from 'vitest';
import { migrateLegacyStorage } from './storageMigration';

const MOMENTS_KEY = 'nimmapp_moments_v1';
const CHECKINS_KEY = 'nimmapp_checkins_v1';
const MIGRATION_KEY = 'cary_storage_schema_v3';

const createLocalStorage = (): Storage => {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => { values.delete(key); },
    setItem: (key, value) => { values.set(key, String(value)); },
  };
};

describe('persisted storage validation', () => {
  beforeEach(() => vi.stubGlobal('localStorage', createLocalStorage()));

  it('removes structurally invalid containers even after schema migration completed', () => {
    localStorage.setItem(MIGRATION_KEY, 'done');
    localStorage.setItem(MOMENTS_KEY, JSON.stringify({ unexpected: 'object' }));
    localStorage.setItem(CHECKINS_KEY, 'null');

    migrateLegacyStorage();

    expect(localStorage.getItem(MOMENTS_KEY)).toBeNull();
    expect(localStorage.getItem(CHECKINS_KEY)).toBeNull();
    expect(localStorage.getItem(MIGRATION_KEY)).toBe('done');
  });

  it('preserves valid entries while dropping malformed entries after migration', () => {
    localStorage.setItem(MIGRATION_KEY, 'done');
    localStorage.setItem(MOMENTS_KEY, JSON.stringify([
      { id: 'meal-1', title: 'Soup', date: '2026-09-19', time: '12:00' },
      null,
      { id: 'broken' },
    ]));
    localStorage.setItem(CHECKINS_KEY, JSON.stringify([
      { id: 'check-1', date: '2026-09-19', time: '08:00', timeOfDay: 'morning', wellbeing: { energyLevel: 4, mood: 'satisfied' } },
      {},
    ]));

    migrateLegacyStorage();

    expect(JSON.parse(localStorage.getItem(MOMENTS_KEY) || '[]')).toEqual([
      { id: 'meal-1', title: 'Soup', date: '2026-09-19', time: '12:00' },
    ]);
    expect(JSON.parse(localStorage.getItem(CHECKINS_KEY) || '[]')).toEqual([
      { id: 'check-1', date: '2026-09-19', time: '08:00', timeOfDay: 'morning', wellbeing: { energyLevel: 4, mood: 'satisfied' } },
    ]);
  });

  it('preserves legitimate sparse voice-only check-ins', () => {
    const voiceOnly = {
      id: 'voice-midday',
      date: '2026-09-19',
      time: '13:15',
      timeOfDay: 'midday',
      food: { mealTitle: 'كسكس بالخضرة', category: 'lunch' },
      wellbeing: { voiceTranscription: 'فالغدا كليت كسكس بالخضرة وكنت جوعان' },
      createdAt: 1,
    };
    localStorage.setItem(MIGRATION_KEY, 'done');
    localStorage.setItem(CHECKINS_KEY, JSON.stringify([voiceOnly]));

    migrateLegacyStorage();

    expect(JSON.parse(localStorage.getItem(CHECKINS_KEY) || '[]')).toEqual([voiceOnly]);
  });
});
