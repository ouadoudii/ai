import { describe, expect, it } from 'vitest';
import {
  PERSONAL_MEAL_VOCABULARY_LIMIT,
  findRememberedMealCorrection,
  rememberMealCorrection,
} from './personalMealVocabulary';

describe('personal meal vocabulary', () => {
  it('preserves the preferred mixed-script wording verbatim', () => {
    const entries = rememberMealCorrection([], '  بيض  ', 'بيض مسلوق + pain complet', '2026-09-30T10:00:00.000Z');
    expect(findRememberedMealCorrection(entries, 'بيض')?.preferred).toBe('بيض مسلوق + pain complet');
  });

  it('matches normalized case and whitespace while keeping the latest preference', () => {
    const first = rememberMealCorrection([], 'Cafe au lait', 'Café au lait', '2026-09-30T09:00:00.000Z');
    const second = rememberMealCorrection(first, '  CAFE   AU LAIT ', 'قهوة بالحليب', '2026-09-30T10:00:00.000Z');
    expect(second).toHaveLength(1);
    expect(findRememberedMealCorrection(second, 'cafe au lait')?.preferred).toBe('قهوة بالحليب');
  });

  it('ignores empty and self mappings', () => {
    expect(rememberMealCorrection([], '', 'بيض')).toEqual([]);
    expect(rememberMealCorrection([], 'Harira', '  harira  ')).toEqual([]);
  });

  it('stays bounded to avoid unbounded personal storage growth', () => {
    let entries = [] as ReturnType<typeof rememberMealCorrection>;
    for (let index = 0; index < PERSONAL_MEAL_VOCABULARY_LIMIT + 5; index += 1) {
      entries = rememberMealCorrection(entries, `meal-${index}`, `preferred-${index}`, `2026-09-30T10:${String(index).padStart(2, '0')}:00.000Z`);
    }
    expect(entries).toHaveLength(PERSONAL_MEAL_VOCABULARY_LIMIT);
    expect(entries[0]?.source).toBe(`meal-${PERSONAL_MEAL_VOCABULARY_LIMIT + 4}`);
  });
});
