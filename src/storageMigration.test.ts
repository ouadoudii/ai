import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadPersistedCheckIns, loadPersistedMoments, migrateLegacyStorage } from './storageMigration';

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

  it('runtime loaders reject valid JSON with invalid container shapes', () => {
    localStorage.setItem(MOMENTS_KEY, JSON.stringify({ unexpected: 'object' }));
    localStorage.setItem(CHECKINS_KEY, 'null');

    expect(loadPersistedMoments()).toEqual([]);
    expect(loadPersistedCheckIns()).toEqual([]);
  });

  it('runtime loaders filter malformed records but preserve valid history', () => {
    const moment = { id: 'meal-1', title: 'Soup', date: '2026-09-19', time: '12:00' };
    const checkIn = { id: 'check-1', date: '2026-09-19', time: '08:00', timeOfDay: 'morning', wellbeing: { energyLevel: 4, mood: 'satisfied' } };
    localStorage.setItem(MOMENTS_KEY, JSON.stringify([moment, null, { id: 'broken' }]));
    localStorage.setItem(CHECKINS_KEY, JSON.stringify([checkIn, {}]));

    expect(loadPersistedMoments()).toEqual([moment]);
    expect(loadPersistedCheckIns()).toEqual([checkIn]);
  });

  it('runtime loaders use a valid legacy fallback when the current payload is corrupt', () => {
    const legacyMoment = { id: 'legacy-meal', title: 'Couscous', date: '2026-09-19', time: '13:00' };
    localStorage.setItem(MOMENTS_KEY, '{}');
    localStorage.setItem('food_journey_moments_v1', JSON.stringify([legacyMoment]));

    expect(loadPersistedMoments()).toEqual([legacyMoment]);
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

describe('legacy migration data safety', () => {
  const legacyKey = 'food_journey_moments_v1';
  const meal = { id: 'legacy', title: 'كسكس Couscous', date: '2026-10-12', time: '12:00' };
  beforeEach(() => vi.stubGlobal('localStorage', createLocalStorage()));

  it('copies legacy meals and sparse check-ins before removing their source', () => {
    const checkIn = { id: 'check', date: '2026-10-12', time: '12:00', timeOfDay: 'midday', wellbeing: {} };
    localStorage.setItem(legacyKey, JSON.stringify([meal]));
    localStorage.setItem('getyourcoach_checkins_v1', JSON.stringify([checkIn]));
    migrateLegacyStorage();
    expect(loadPersistedMoments()).toEqual([meal]);
    expect(loadPersistedCheckIns()).toEqual([checkIn]);
    migrateLegacyStorage();
    expect(loadPersistedMoments()).toEqual([meal]);
  });

  it('merges distinct legacy records without overwriting newer same-id edits', () => {
    const updated = { ...meal, title: 'Edited meal' };
    const older = { ...meal, id: 'older' };
    localStorage.setItem(MOMENTS_KEY, JSON.stringify([updated]));
    localStorage.setItem(legacyKey, JSON.stringify([meal, older]));
    migrateLegacyStorage();
    expect(loadPersistedMoments()).toEqual([updated, older]);
  });

  it('keeps source and migration pending when destination persistence fails', () => {
    const raw = JSON.stringify([meal]);
    localStorage.setItem(legacyKey, raw);
    const setItem = localStorage.setItem.bind(localStorage);
    vi.spyOn(localStorage, 'setItem').mockImplementation((key, value) => {
      if (key === MOMENTS_KEY) throw new Error('quota exceeded');
      setItem(key, value);
    });
    migrateLegacyStorage();
    expect(localStorage.getItem(legacyKey)).toBe(raw);
    expect(localStorage.getItem(MIGRATION_KEY)).not.toBe('done');
  });

  it('does not delete current history when sanitization cannot be persisted', () => {
    const raw = JSON.stringify([meal, null]);
    localStorage.setItem(MOMENTS_KEY, raw);
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new Error('quota exceeded'); });
    migrateLegacyStorage();
    expect(localStorage.getItem(MOMENTS_KEY)).toBe(raw);
    expect(loadPersistedMoments()).toEqual([meal]);
  });

  it('keeps malformed legacy data recoverable without marking migration done', () => {
    localStorage.setItem(legacyKey, '{broken');
    migrateLegacyStorage();
    expect(localStorage.getItem(legacyKey)).toBe('{broken');
    expect(localStorage.getItem(MIGRATION_KEY)).not.toBe('done');
  });
});
