import { describe, expect, it } from 'vitest';
import type { FoodMoment, MomentCategory } from './types';
import { derivePersonalMealRotation } from './personalMealRotation';

const moment = (
  id: string,
  title: string,
  date: string,
  category: MomentCategory = 'breakfast',
  tags: string[] = [],
): FoodMoment => ({
  id,
  title,
  label: title,
  category,
  date,
  time: '08:00',
  location: '',
  locationCategory: 'home',
  imageUrl: '',
  mood: 'satisfied',
  tags,
  createdAt: Date.parse(`${date}T08:00:00`),
});

describe('derivePersonalMealRotation', () => {
  it('suggests the most recent different meal after three repeated meals', () => {
    const history = [
      moment('1', 'بيض مسلوق + pain complet', '2026-09-30'),
      moment('2', '  بيض مسلوق + pain complet ', '2026-09-29'),
      moment('3', 'بيض مسلوق + PAIN COMPLET', '2026-09-28'),
      moment('4', 'Msemen + أتاي', '2026-09-27'),
      moment('5', 'Porridge', '2026-09-26'),
    ];

    expect(derivePersonalMealRotation(history, 'breakfast')).toEqual({
      title: 'Msemen + أتاي',
      sourceMomentId: '4',
    });
  });

  it('returns nothing when the last three meals are not the same', () => {
    const history = [
      moment('1', 'Eggs', '2026-09-30'),
      moment('2', 'Porridge', '2026-09-29'),
      moment('3', 'Eggs', '2026-09-28'),
      moment('4', 'Msemen', '2026-09-27'),
    ];
    expect(derivePersonalMealRotation(history, 'breakfast')).toBeNull();
  });

  it('ignores demo, blank and other-category moments', () => {
    const history = [
      moment('demo', 'Porridge', '2026-10-01', 'breakfast', ['Demo']),
      moment('blank', '   ', '2026-10-01'),
      moment('lunch', 'Couscous', '2026-10-01', 'lunch'),
      moment('1', 'Atay', '2026-09-30'),
      moment('2', 'atay', '2026-09-29'),
      moment('3', 'ATAY', '2026-09-28'),
      moment('4', 'Harira', '2026-09-27'),
    ];
    expect(derivePersonalMealRotation(history, 'breakfast')?.title).toBe('Harira');
  });

  it('requires an earlier real alternative instead of inventing one', () => {
    const history = [
      moment('1', 'بيض', '2026-09-30'),
      moment('2', 'بيض', '2026-09-29'),
      moment('3', 'بيض', '2026-09-28'),
    ];
    expect(derivePersonalMealRotation(history, 'breakfast')).toBeNull();
  });
});
