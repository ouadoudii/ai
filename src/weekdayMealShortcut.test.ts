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
      meal('Couscous', '2026-08-26', 'lunch', ['sample']),
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
  it('excludes future and target-day entries from historical observations', () => {
    const future = ['2026-10-24', '2026-10-31', '2026-11-07'].map(date => meal('Pizza', date, 'food'));
    expect(deriveWeekdayMealShortcut(future, '2026-10-17', 'food')).toBeNull();
    expect(deriveWeekdayMealShortcut([...future, meal('Pizza', '2026-10-17', 'food')], '2026-10-17', 'food')).toBeNull();
  });

  it('counts only earlier observations when past and future meals are mixed', () => {
    const dates = ['2026-09-26', '2026-10-03', '2026-10-10', '2026-10-17', '2026-10-24'];
    const history = dates.map(date => meal('حريرة + pain', date, 'food'));
    expect(deriveWeekdayMealShortcut(history, '2026-10-17', 'food')).toEqual({
      title: 'حريرة + pain', observations: 3, weekday: 6, category: 'food',
    });
    expect(deriveWeekdayMealShortcut(history.slice(1), '2026-10-17', 'food')).toBeNull();
  });

  it('preserves year-boundary and DST-crossing local calendar comparisons', () => {
    const newYear = ['2025-12-13', '2025-12-20', '2025-12-27', '2026-01-03'];
    expect(deriveWeekdayMealShortcut(newYear.map(date => meal('كسكس', date)), '2026-01-03', 'lunch')).toEqual({
      title: 'كسكس', observations: 3, weekday: 6, category: 'lunch',
    });
    const dst = ['2026-03-08', '2026-03-15', '2026-03-22', '2026-03-29', '2026-04-05'];
    expect(deriveWeekdayMealShortcut(dst.map(date => meal('بيض + khobz', date)), '2026-03-29', 'lunch')).toEqual({
      title: 'بيض + khobz', observations: 3, weekday: 0, category: 'lunch',
    });
  });

});
