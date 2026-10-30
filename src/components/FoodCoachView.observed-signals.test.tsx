import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { FoodMoment } from '../types';
import { FoodCoachView } from './FoodCoachView';

vi.mock('../i18n', () => ({ useLanguage: () => ({ language: 'ar' }) }));
vi.mock('../utils/coachSession', () => ({
  restoreCoachSessionOrDefault: (messages: unknown[]) => messages,
  writeCoachSession: () => undefined,
}));

const meal = (fields: Partial<FoodMoment> = {}): FoodMoment => ({
  id: 'body-unknown', title: 'نص tajine ديال الدجاج بلا زيت',
  label: 'غداء', category: 'lunch', date: '2026-10-30', time: '13:00',
  location: 'الدار', locationCategory: 'home', imageUrl: '',
  mood: 'satisfied', tags: [], createdAt: 1, ...fields,
});
const render = (moments: FoodMoment[]) => renderToStaticMarkup(
  <FoodCoachView moments={moments} checkIns={[]} onOpenAddModal={vi.fn()} onSelectMoment={vi.fn()} />
);

describe('Arabic Coach recent observations', () => {
  it('shows supportive unknown states instead of invented 3/5 and 4/5', () => {
    const html = render([meal()]);
    expect(html).toContain('data-testid="coach-recent-signals-body-unknown"');
    expect(html).toContain('الجوع: لم يُسجّل • الشبع: لم يُسجّل');
    expect(html).not.toContain('الجوع 3/5 • الشبع 4/5');
    expect(html).toContain('دون أي ضغط');
    expect(html).not.toMatch(/Überessen|Küchenschluss|فشل|عقاب/);
  });
  it('keeps unknown signals visible alongside automatically generated meal feedback', () => {
    const html = render([meal({
      coachFeedback: {
        title: 'لحظة من يومك',
        message: 'تم تسجيل الوجبة. يمكنك إضافة ملاحظات لاحقًا دون أي ضغط.',
        type: 'insight',
        badge: 'ملاحظة محفوظة',
      },
    })]);
    expect(html).toContain('data-testid="coach-recent-signals-body-unknown"');
    expect(html).toContain('الجوع: لم يُسجّل • الشبع: لم يُسجّل');
    expect(html).toContain('يمكنك إضافة ملاحظات لاحقًا دون أي ضغط');
  });

  it('shows both explicitly recorded values, including zero', () => {
    const html = render([meal({ id: 'observed', hungerLevel: 0, fullnessLevel: 4 })]);
    expect(html).toContain('data-testid="coach-recent-signals-observed"');
    expect(html).toContain('الجوع: 0/5 • الشبع: 4/5');
  });
});
