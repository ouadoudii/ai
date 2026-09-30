import { describe, expect, it } from 'vitest';
import { derivePersonalMealCompanion } from './personalMealCompanion';

describe('derivePersonalMealCompanion', () => {
  it('suggests the unique companion after three real co-occurrences and preserves latest spelling', () => {
    const history = [
      { items: ['بيض مسلوق', 'Pain complet'] },
      { items: ['بيض مسلوق', 'pain complet'] },
      { items: ['بيض مسلوق', 'PAIN complet'] },
    ];
    expect(derivePersonalMealCompanion(' بيض مسلوق ', history)).toEqual({
      value: 'PAIN complet',
      coOccurrences: 3,
    });
  });

  it('ignores demo/seed meals, blanks, current item and duplicate extraction within one meal', () => {
    const history = [
      { items: ['بيض', 'خبز', 'خبز', ''], source: 'user' },
      { items: ['بيض', 'خبز'], isDemo: true },
      { items: ['بيض', 'خبز'], source: 'seed' },
      { items: ['بيض', 'خبز'] },
      { items: ['بيض', 'خبز'] },
    ];
    expect(derivePersonalMealCompanion('بيض', history)).toEqual({ value: 'خبز', coOccurrences: 3 });
  });

  it('returns nothing for sparse evidence', () => {
    expect(derivePersonalMealCompanion('café', [
      { items: ['café', 'خبز'] },
      { items: ['café', 'خبز'] },
    ])).toBeNull();
  });

  it('returns nothing for a tied winner rather than guessing', () => {
    const history = Array.from({ length: 3 }, () => ({ items: ['œufs', 'pain', 'thé'] }));
    expect(derivePersonalMealCompanion('œufs', history)).toBeNull();
  });
});
