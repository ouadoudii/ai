import { describe, expect, it } from 'vitest';
import { deriveDeletedIds, mergeById, mergeMemory, withLocalDeletions } from './auth/caryCloudMemory';
import type { DailyCheckIn, FoodMoment } from './types';

describe('Cary cloud memory', () => {
  it('merges remote and local records without losing unique ids', () => {
    const local = [{ id: 'local', title: 'Local' }] as FoodMoment[];
    const remote = [{ id: 'remote', title: 'Remote' }] as FoodMoment[];
    expect(mergeById(local, remote).map((item) => item.id).sort()).toEqual(['local', 'remote']);
  });

  it('prefers the current device when the same id exists on both sides', () => {
    const local = [{ id: 'same', title: 'Edited locally' }] as FoodMoment[];
    const remote = [{ id: 'same', title: 'Older cloud copy' }] as FoodMoment[];
    expect(mergeById(local, remote)[0].title).toBe('Edited locally');
  });

  it('merges moments and check-ins independently', () => {
    const merged = mergeMemory(
      { moments: [{ id: 'm1' }] as FoodMoment[], checkIns: [{ id: 'c1' }] as DailyCheckIn[] },
      { moments: [{ id: 'm2' }] as FoodMoment[], checkIns: [{ id: 'c2' }] as DailyCheckIn[] },
    );
    expect(merged.moments).toHaveLength(2);
    expect(merged.checkIns).toHaveLength(2);
  });

  it('derives an explicit deletion only for records previously synced on this device', () => {
    const baseline = [{ id: 'keep' }, { id: 'deleted' }];
    const current = [{ id: 'keep' }, { id: 'new-offline' }];
    expect(deriveDeletedIds(baseline, current)).toEqual(['deleted']);
  });

  it('keeps a locally deleted moment and check-in deleted when stale cloud data still contains them', () => {
    const baseline = {
      moments: [{ id: 'm1', title: 'بيض مسلوق · pain complet' }] as FoodMoment[],
      checkIns: [{ id: 'c1' }] as DailyCheckIn[],
    };
    const local = withLocalDeletions({ moments: [], checkIns: [] }, baseline);
    const remote = baseline;
    const merged = mergeMemory(local, remote);

    expect(merged.moments).toEqual([]);
    expect(merged.checkIns).toEqual([]);
    expect(merged.deletedMomentIds).toEqual(['m1']);
    expect(merged.deletedCheckInIds).toEqual(['c1']);
  });

  it('prevents a stale device from resurrecting a cloud tombstone while preserving unrelated offline additions', () => {
    const staleDevice = {
      moments: [
        { id: 'deleted', title: 'Harira' },
        { id: 'offline-new', title: 'Kaffee et msemen' },
      ] as FoodMoment[],
      checkIns: [],
    };
    const cloud = {
      moments: [] as FoodMoment[],
      checkIns: [] as DailyCheckIn[],
      deletedMomentIds: ['deleted'],
    };
    const merged = mergeMemory(staleDevice, cloud);

    expect(merged.moments.map((item) => item.id)).toEqual(['offline-new']);
    expect(merged.deletedMomentIds).toEqual(['deleted']);
  });
});
