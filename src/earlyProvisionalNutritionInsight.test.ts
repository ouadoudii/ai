import { describe, expect, it } from 'vitest';
import { analyzeNutritionType } from './utils/nutritionTypeEngine';
import type { FoodMoment } from './types';

const meal = (overrides: Partial<FoodMoment> = {}): FoodMoment => ({
  id: `user-${Math.random()}`,
  title: 'Mittagessen',
  label: 'Mittagessen',
  category: 'lunch',
  date: 'Heute',
  time: '13:00',
  rating: 4,
  tags: [],
  createdAt: Date.now(),
  ...overrides,
} as FoodMoment);

describe('early provisional nutrition orientation', () => {
  it('gives a clearly provisional, useful orientation after only a few real entries', () => {
    const profile = analyzeNutritionType([
      meal({ nutrition: { protein: 32 } as FoodMoment['nutrition'] }),
      meal({ time: '19:00', nutrition: { protein: 28 } as FoodMoment['nutrition'] }),
    ]);

    expect(profile.unlocked).toBe(false);
    expect(profile.typeName).toContain('Vorläufig');
    expect(profile.description.toLowerCase()).toContain('vorläufig');
    expect(profile.recommendedFocus).toContain('2/12');
    expect(profile.recommendedFocus).toMatch(/verfein|aktualis/i);
  });

  it('does not invent a personal pattern before any real user evidence exists', () => {
    const profile = analyzeNutritionType([]);
    expect(profile.typeName).toBe('Noch keine persönliche Einschätzung');
    expect(profile.description).toMatch(/ersten.*Eintr/i);
  });
});
