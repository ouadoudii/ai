import { describe, expect, it } from 'vitest';
import type { FoodMoment, MomentCategory } from '../types';
import { derivePersonalFrequentLocation } from './personalFrequentLocation';

const moment = (id: string, location: string, createdAt: number, category: MomentCategory = 'lunch') => ({
  id,
  title: 'meal',
  label: 'meal',
  category,
  date: '2026-09-30',
  time: '12:00',
  location,
  locationCategory: 'home',
  imageUrl: '',
  mood: 'satisfied',
  tags: [],
  createdAt,
} as FoodMoment);

describe('derivePersonalFrequentLocation', () => {
  it('returns a unique location after three real same-category observations', () => {
    const result = derivePersonalFrequentLocation([
      moment('1', 'Bureau Zürich', 1),
      moment('2', ' bureau  zürich ', 2),
      moment('3', 'BUREAU ZÜRICH', 3),
      moment('4', 'Home', 4),
    ], 'lunch');
    expect(result).toEqual({ location: 'BUREAU ZÜRICH', observations: 3 });
  });

  it('ignores demo-like records, blanks, and other meal categories', () => {
    const result = derivePersonalFrequentLocation([
      moment('demo-1', 'المكتب', 1),
      moment('seed-2', 'المكتب', 2),
      moment('3', 'المكتب', 3, 'breakfast'),
      moment('4', '  ', 4),
      moment('5', 'المكتب', 5),
    ], 'lunch');
    expect(result).toBeNull();
  });

  it('returns nothing for sparse history or a tie', () => {
    expect(derivePersonalFrequentLocation([moment('1', 'Home', 1), moment('2', 'Home', 2)], 'lunch')).toBeNull();
    expect(derivePersonalFrequentLocation([
      moment('1', 'Home', 1), moment('2', 'Home', 2), moment('3', 'Home', 3),
      moment('4', 'Work', 4), moment('5', 'Work', 5), moment('6', 'Work', 6),
    ], 'lunch')).toBeNull();
  });

  it('preserves the latest exact multilingual spelling for display', () => {
    const result = derivePersonalFrequentLocation([
      moment('1', 'café المركز', 1),
      moment('2', 'CAFÉ المركز', 2),
      moment('3', 'Café المركز', 9),
    ], 'lunch');
    expect(result?.location).toBe('Café المركز');
  });
});
