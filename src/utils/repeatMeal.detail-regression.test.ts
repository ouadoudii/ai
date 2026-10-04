import { describe, expect, it } from 'vitest';
import { repeatMeal } from './repeatMeal';
import type { FoodMoment } from '../types';

describe('repeatMeal detail action contract', () => {
  it('preserves meal identity while dropping occurrence-specific context', () => {
    const source: FoodMoment = {
      id: 'old-meal',
      title: 'بيض مسلوق + pain complet',
      label: 'Breakfast',
      category: 'breakfast',
      date: '2026-09-20',
      time: '08:15',
      location: 'Old café',
      locationCategory: 'restaurant',
      imageUrl: '',
      rating: 2,
      mood: 'stressed',
      hungerLevel: 5,
      fullnessLevel: 4,
      energyAfter: 'sluggish',
      notes: 'old context must not repeat',
      tags: ['old-context'],
      isFavorite: true,
      createdAt: 1,
    };

    const repeated = repeatMeal(source, new Date('2026-10-05T09:30:00'));

    expect(repeated.title).toBe(source.title);
    expect(repeated.category).toBe(source.category);
    expect(repeated.id).not.toBe(source.id);
    expect(repeated.location).toBe('');
    expect(repeated.rating).toBeUndefined();
    expect(repeated.mood).toBeUndefined();
    expect(repeated.hungerLevel).toBeUndefined();
    expect(repeated.fullnessLevel).toBeUndefined();
    expect(repeated.energyAfter).toBeUndefined();
    expect(repeated.notes).toBeUndefined();
    expect(repeated.isFavorite).toBe(false);
  });
});
