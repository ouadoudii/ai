import { describe, expect, it } from 'vitest';
import { addMealItem, buildMealTitle, parseMealTitle, removeMealItem } from './mealItems';

describe('mealItems', () => {
  it('round-trips multilingual composite meals without losing components', () => {
    const items = ['بيض مسلوق', 'pain complet', 'Kaffee', 'زيت الزيتون'];
    const title = buildMealTitle(items);

    expect(parseMealTitle(title)).toEqual(items);
  });

  it('preserves existing components while adding and removing one item', () => {
    const original = parseMealTitle('بيض · pain complet · Kaffee');
    const withFruit = addMealItem(original, '  pomme  ');

    expect(buildMealTitle(withFruit)).toBe('بيض · pain complet · Kaffee · pomme');
    expect(buildMealTitle(removeMealItem(withFruit, 1))).toBe('بيض · Kaffee · pomme');
  });

  it('does not duplicate an existing item when casing or spacing differs', () => {
    const items = ['Café au lait'];

    expect(addMealItem(items, '  café   au lait ')).toEqual(items);
  });
});
