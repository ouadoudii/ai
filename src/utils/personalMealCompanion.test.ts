import { describe, expect, it } from 'vitest';
import { suggestPersonalMealCompanion } from './personalMealCompanion';

describe('suggestPersonalMealCompanion', () => {
  it('learns a recurring mixed-script companion after three real co-occurrences', () => {
    const history = [
      { items: ['بيض مسلوق', 'Pain complet'] },
      { items: ['بيض مسلوق', 'pain   complet'] },
      { items: ['بيض مسلوق', 'pain complet'] },
    ];
    expect(suggestPersonalMealCompanion('  بيض مسلوق ', history)).toBe('pain complet');
  });

  it('ignores demo meals, blank items and the current item itself', () => {
    const history = [
      { items: ['بيض', 'خبز'], isDemo: true },
      { items: ['بيض', '   '] },
      { items: ['بيض', 'بيض'] },
      { items: ['بيض', 'خبز'] },
      { items: ['بيض', 'خبز'] },
    ];
    expect(suggestPersonalMealCompanion('بيض', history)).toBeNull();
  });

  it('returns no suggestion for a tied history', () => {
    const history = [
      { items: ['بيض', 'خبز', 'قهوة'] },
      { items: ['بيض', 'خبز', 'قهوة'] },
      { items: ['بيض', 'خبز', 'قهوة'] },
    ];
    expect(suggestPersonalMealCompanion('بيض', history)).toBeNull();
  });

  it('preserves the latest exact user-authored spelling for the unique winner', () => {
    const history = [
      { items: ['omelette', 'Atay b na3na3'] },
      { items: ['omelette', 'atay b na3na3'] },
      { items: ['omelette', 'أتاي b na3na3'] },
      { items: ['omelette', 'khobz'] },
    ];
    expect(suggestPersonalMealCompanion('OMELETTE', history)).toBe('أتاي b na3na3');
  });

  it('does not double-count duplicate companion tokens within one meal', () => {
    const history = [
      { items: ['بيض', 'خبز', 'خبز', 'خبز'] },
      { items: ['بيض', 'خبز'] },
    ];
    expect(suggestPersonalMealCompanion('بيض', history)).toBeNull();
  });
});
