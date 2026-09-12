import { describe, expect, it } from 'vitest';
import { getCheckInMomentCopy } from './utils/checkInMomentLocalization';

describe('check-in generated meal moment copy', () => {
  it('uses German meal and metadata copy in German', () => {
    expect(getCheckInMomentCopy('de', 'breakfast')).toEqual({
      label: 'Frühstück',
      location: 'Nicht angegeben',
      captured: 'Erfasst',
      fallbackSummary: 'Für spätere Mustervergleiche gespeichert.',
      badge: 'Check-in',
    });
  });

  it('uses Arabic meal and metadata copy in Arabic', () => {
    expect(getCheckInMomentCopy('ar', 'lunch')).toEqual({
      label: 'غداء',
      location: 'غير محدد',
      captured: 'تم التسجيل',
      fallbackSummary: 'تم الحفظ لمقارنة الأنماط لاحقًا.',
      badge: 'تسجيل',
    });
  });

  it('keeps existing English copy in English', () => {
    expect(getCheckInMomentCopy('en', 'dinner')).toEqual({
      label: 'Dinner',
      location: 'Not specified',
      captured: 'Captured',
      fallbackSummary: 'Saved for future pattern comparisons.',
      badge: 'Check-in',
    });
  });

  it.each([
    ['en', 'Snack'],
    ['de', 'Snack'],
    ['ar', 'وجبة خفيفة'],
  ] as const)('keeps saved snack check-ins labeled as snacks in %s', (language, expectedLabel) => {
    expect(getCheckInMomentCopy(language, 'snack').label).toBe(expectedLabel);
  });
});
