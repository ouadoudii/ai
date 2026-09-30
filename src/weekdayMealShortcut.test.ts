import { describe, expect, it } from 'vitest';
import { deriveWeekdayMealShortcut, type WeekdayMealMoment } from './weekdayMealShortcut';

const meal = (title: string, date: string, category = 'lunch', tags: string[] = []): WeekdayMealMoment =>
  ({ title, date, category, tags });

describe('deriveWeekdayMealShortcut', () => {
  it('learns a unique same-weekday/category repeat and preserves latest mixed-script spelling', () => {
    const moments = [
      meal('بيض مسلوق + pain complet', '2026-09-02'),
      meal('  بيض مسلوق + pain complet  ', '2026-09-09'),
      meal('بيض مسلوق + pain complet', '2026-09-16'),
      meal('Harira', '2026-09-23'),
    ];
    expect(deriveWeekdayMealShortcut(moments, '2026-09-30', 'lunch')).toEqual({
      title: 'بيض مسلوق + pain complet', observations: 3, weekday: 3, category: 'lunch',
    });
  });

  it('ignores demo, invalid-date, blank and other-category records', () => {
    const moments = [
      meal('Couscous', '2026-09-02'),
      meal('Couscous', '2026-09-09', 'lunch', ['demo']),
      meal('Couscous', 'bad-date'),
      meal('   ', '2026-09-16'),
      meal('Couscous', '2026-09-23', 'dinner'),
    ];
    expect(deriveWeekdayMealShortcut(moments, '2026-09-30', 'lunch')).toBeNull();
  });

  it('suppresses sparse history and tied winners', () => {
    const sparse = [meal('A', '2026-09-02'), meal('A', '2026-09-09')];
    expect(deriveWeekdayMealShortcut(sparse, '2026-09-30', 'lunch')).toBeNull();

    const tied = [
      meal('A', '2026-09-02'), meal('A', '2026-09-09'), meal('A', '2026-09-16'),
      meal('B', '2026-08-05'), meal('B', '2026-08-12'), meal('B', '2026-08-19'),
    ];
    expect(deriveWeekdayMealShortcut(tied, '2026-09-30', 'lunch')).toBeNull();
  });

  it('rejects impossible target dates instead of rolling them into another weekday', () => {
    expect(deriveWeekdayMealShortcut([], '2026-02-31', 'lunch')).toBeNull();
  });
});
