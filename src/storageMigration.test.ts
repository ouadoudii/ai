import { beforeEach, describe, expect, it } from 'vitest';
import { migrateLegacyStorage } from './storageMigration';

const MOMENTS_KEY = 'nimmapp_moments_v1';
const CHECKINS_KEY = 'nimmapp_checkins_v1';
const MIGRATION_KEY = 'cary_storage_schema_v3';

describe('persisted storage validation', () => {
  beforeEach(() => localStorage.clear());

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
      { id: 'check-1', date: '2026-09-19', time: '08:00', wellbeing: { energyLevel: 4, mood: 'good' } },
      {},
    ]));

    migrateLegacyStorage();

    expect(JSON.parse(localStorage.getItem(MOMENTS_KEY) || '[]')).toEqual([
      { id: 'meal-1', title: 'Soup', date: '2026-09-19', time: '12:00' },
    ]);
    expect(JSON.parse(localStorage.getItem(CHECKINS_KEY) || '[]')).toEqual([
      { id: 'check-1', date: '2026-09-19', time: '08:00', wellbeing: { energyLevel: 4, mood: 'good' } },
    ]);
  });
});
