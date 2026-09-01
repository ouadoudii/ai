import { describe, expect, it } from 'vitest';
import { mergeById, mergeMemory } from './auth/caryCloudMemory';
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
});
