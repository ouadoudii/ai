import { describe, expect, it } from 'vitest';
import type { FoodMoment } from './types';
import { repeatMeal } from './utils/repeatMeal';

const oldMeal: FoodMoment = {
  id: 'old', title: 'كسكس بالخضر', label: 'Lunch', category: 'lunch',
  date: '2026-09-19', time: '13:10', location: 'Restaurant Atlas',
  locationCategory: 'restaurant', imageUrl: '/couscous.jpg', rating: 2,
  mood: 'satisfied', hungerLevel: 5, fullnessLevel: 4, eatingPace: 'rushed',
  distraction: 'social', energyAfter: 'sluggish', notes: 'Business lunch',
  tags: ['Moroccan', 'source-checkin:abc'], isFavorite: true,
  nutrition: { protein: 18 }, price: '28 CHF', companions: 'Samir', createdAt: 1,
};

describe('repeatMeal', () => {
  it('keeps dish identity but never copies occurrence-specific personal facts', () => {
    const repeated = repeatMeal(oldMeal, new Date(2026, 8, 20, 15, 45));
    expect(repeated.title).toBe('كسكس بالخضر');
    expect(repeated.category).toBe('lunch');
    expect(repeated.imageUrl).toBe('/couscous.jpg');
    expect(repeated.nutrition).toEqual({ protein: 18 });
    expect(repeated.date).toBe('2026-09-20');
    expect(repeated.time).toBe('15:45');
    expect(repeated.location).toBe('');
    expect(repeated.locationCategory).toBeUndefined();
    expect(repeated.rating).toBeUndefined();
    expect(repeated.mood).toBeUndefined();
    expect(repeated.hungerLevel).toBeUndefined();
    expect(repeated.fullnessLevel).toBeUndefined();
    expect(repeated.eatingPace).toBeUndefined();
    expect(repeated.distraction).toBeUndefined();
    expect(repeated.energyAfter).toBeUndefined();
    expect(repeated.notes).toBeUndefined();
    expect(repeated.price).toBeUndefined();
    expect(repeated.companions).toBeUndefined();
    expect(repeated.isFavorite).toBe(false);
    expect(repeated.tags).toEqual(['Repeated']);
  });
});
