import { describe, expect, it } from 'vitest';
import { hasMealEvidence } from './mealEvidence';

describe('hasMealEvidence', () => {
  it('rejects a completely blank new capture', () => {
    expect(hasMealEvidence({ editingExisting: false, items: [], draftTitle: '   ', imageUrl: '' })).toBe(false);
  });

  it('does not treat notes or category defaults as meal evidence', () => {
    expect(hasMealEvidence({ editingExisting: false, items: [], draftTitle: '', imageUrl: '' })).toBe(false);
  });

  it.each([
    { items: ['Harira'], draftTitle: '', imageUrl: '' },
    { items: [], draftTitle: 'بيض مسلوق', imageUrl: '' },
    { items: [], draftTitle: '', imageUrl: 'data:image/jpeg;base64,food-photo' },
  ])('accepts explicit food evidence %#', evidence => {
    expect(hasMealEvidence({ editingExisting: false, ...evidence })).toBe(true);
  });

  it('keeps legacy existing moments editable', () => {
    expect(hasMealEvidence({ editingExisting: true, items: [], draftTitle: '', imageUrl: '' })).toBe(true);
  });
});
