import { describe, expect, it } from 'vitest';
import { buildEarlyOrientationCopy } from './utils/earlyOrientation';

describe('supportive early personal observations', () => {
  it.each([
    ['de', 'Deine bisherigen Beobachtungen', 'Dein Rhythmus, kein Etikett'],
    ['en', 'Your observations so far', 'Your rhythm, not a label'],
    ['fr', 'Tes observations jusqu’ici', 'Ton rythme, sans étiquette'],
    ['ar', 'ملاحظاتك حتى الآن', 'إيقاعك، بلا تصنيفات'],
  ] as const)('keeps %s observation-based, without animal types or quotas', (language, label, title) => {
    const copy = buildEarlyOrientationCopy(language, 'protein_performer', 2);
    expect(copy.label).toBe(label);
    expect(copy.title).toBe(title);
    expect(copy.description).toContain('2');
    expect(copy.dataBasis).toContain('2');
    expect(copy.progress).not.toContain('/12');
    expect(JSON.stringify(copy)).not.toMatch(/الأسد|الثعلب|الدب|الذئب|Lion|Fox|Bear|Wolf|Löwe|Fuchs|Renard|Ours/);
  });

  it('never infers a personal identity from an archetype, even with many entries', () => {
    const types = ['protein_performer', 'circadian_rhythm', 'intuitive_mindful', 'intermittent_balancer'] as const;
    const examples = types.map(type => buildEarlyOrientationCopy('ar', type, 20));
    expect(examples.every(copy => JSON.stringify(copy) === JSON.stringify(examples[0]))).toBe(true);
    expect(examples[0].description).toContain('من غير تصنيف لك أو تقييم لطعامك');
    expect(examples[0].progress).toContain('التسجيل اختياري');
  });

  it('normalizes empty or invalid counts and never asks for a daily streak', () => {
    for (const count of [0, -1, Number.NaN]) {
      const copy = buildEarlyOrientationCopy('ar', 'intuitive_mindful', count);
      expect(copy.title).toBe('ابدأ بلحظة على راحتك');
      expect(copy.description).toContain('لا حاجة إلى تسجيل كل يوم');
      expect(copy.dataBasis).toBe('لا توجد لحظات مسجّلة بعد');
    }
  });
});
