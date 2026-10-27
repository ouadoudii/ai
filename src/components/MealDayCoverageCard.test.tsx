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
  it('maps each date to its real entry rather than falsely filling the first N days', () => {
    language='en';
    const html=render(['2026-10-02','2026-10-01','2026-09-29']);
    const marks=[...html.matchAll(/data-date="([^"]+)" data-logged="([^"]+)"/g)].map(match=>[match[1],match[2]]);
    expect(marks).toEqual([
      ['2026-09-26','false'],['2026-09-27','false'],['2026-09-28','false'],
      ['2026-09-29','true'],['2026-09-30','false'],['2026-10-01','true'],
      ['2026-10-02','true'],
    ]);
    expect(html).toContain('No entry — taking a break is okay');
    expect(html).toContain('A moment was recorded');
    expect(html).toContain('role="list"');
    expect((html.match(/role="listitem"/g)||[]).length).toBe(7);
  });
  it('uses Arabic RTL and treats unrecorded days without blame', () => {
    language='ar';
    const html=render(['2026-10-02','2026-09-29']);
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('لا يوجد تسجيل، وهذا طبيعي');
    expect(html).toContain('الأيام التي لم تسجّل فيها طبيعية أيضاً');
    expect(html).not.toMatch(/فشل|عقوبة|سلسلة متواصلة|ممنوع/);
    expect(html).toMatch(/date[Tt]ime="2026-09-29"/);
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
