import { expect, test } from 'vitest';
import { derivePersonalFrequentLocation } from './personalFrequentLocation';
import type { FoodMoment } from '../types';

test('frequent snack location requires three real observations and preserves newest spelling', () => {
  const moments = [' CAFÉ ATLAS ', 'café atlas', 'Café Atlas'].map((location, index) => ({
    id: 'real-' + index, category: 'snack', location, createdAt: index + 1,
  })) as FoodMoment[];
  expect(derivePersonalFrequentLocation(moments.slice(0, 2), 'snack')).toBeNull();
  expect(derivePersonalFrequentLocation(moments, 'snack')?.location).toBe('Café Atlas');
  expect(derivePersonalFrequentLocation(moments, 'coffee')).toBeNull();
});
