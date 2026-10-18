import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { MealDayCoverageCard } from './MealDayCoverageCard';

let language='en';
vi.mock('../i18n', () => ({ useLanguage: () => ({ language }) }));
const moment = (id: string, date: string) => ({ id, date, createdAt: 0 } as never);
const render = (dates: string[]) => renderToStaticMarkup(<MealDayCoverageCard referenceDate="2026-10-02" moments={dates.map((date, i) => moment('real-' + i, date))} />);

describe('MealDayCoverageCard', () => {
  it('shows distinct seven-day coverage when history is meaningful', () => {
    const html = render(['2026-10-02', '2026-10-01', '2026-09-29']);
    expect(html).toContain('data-testid="meal-day-coverage"');
    expect(html).toContain('3 of the last 7 days are represented');
    expect(html).toContain('aria-label="3/7"');
  });
  it('does not pressure sparse-history users with a coverage card', () => {
    expect(render(['2026-10-02'])).not.toContain('data-testid="meal-day-coverage"');
  });

  it.each([
    ['en','3 of the last 7 days are represented'],
    ['de','3 der letzten 7 Tage sind erfasst'],
    ['fr','3 des 7 derniers jours sont représentés'],
    ['ar','سجّلت لحظات في 3 من آخر 7 أيام'],
  ])('keeps the visible coverage neutral and localized in %s',(locale,title)=>{
    language=locale;
    expect(render(['2026-10-02','2026-10-01','2026-09-29'])).toContain(title);
  });
});
