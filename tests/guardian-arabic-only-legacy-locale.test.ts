import { describe, expect, it } from 'vitest';
import { getGuardianCopy } from '../src/utils/guardianLocalization';
import type { AppLanguage } from '../src/i18n';

describe('Guardian Arabic-only legacy-locale safety', () => {
  it('returns the same supportive Arabic copy for all legacy stored locales', () => {
    const arabic = getGuardianCopy('ar');
    for (const legacy of ['en', 'de', 'fr'] as AppLanguage[]) {
      expect(getGuardianCopy(legacy)).toEqual(arabic);
    }
    expect(arabic.title).toBe('مساحة لطيفة للاهتمام بنفسك');
    expect(arabic.activeAlarm(3)).toBe('أفكار يمكنك تجاهلها');
    expect(arabic.done).toBe('إخفاء الفكرة');
  });

  it('has no non-Arabic, invented hormone, punitive or urgent alarm copy in any Guardian state', () => {
    const copy = getGuardianCopy('ar');
    const visible = Object.values(copy).flatMap(value =>
      typeof value === 'function' ? [value(2)] :
      typeof value === 'string' ? [value] : Object.values(value)
    );
    expect(visible.length).toBeGreaterThan(20);
    for (const text of visible) {
      expect(text).not.toMatch(/[A-Za-z]|Ghrelin|ghréline|28%|⚠️|فشل|عقاب|إنذار/);
    }
    expect(copy.noIntervention).toBe('هنا متى احتجت');
    expect(copy.acute).toBe('اقتراح لطيف');
  });
});
