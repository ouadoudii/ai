import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { FoodMoment } from '../types';
import { LoggingStreakCard } from './LoggingStreakCard';

let language = 'en';
vi.mock('../i18n', () => ({ useLanguage: () => ({ language }) }));

const moment = (id: string, date: string): FoodMoment =>
  ({ id, title: 'Meal', category: 'breakfast', date, time: '08:00', createdAt: 1 } as FoodMoment);

const render = (moments: FoodMoment[]) => renderToStaticMarkup(<LoggingStreakCard moments={moments} />);

describe('gentle journal history card', () => {
  it('counts nonconsecutive days without streaks, best scores, or reset pressure', () => {
    language = 'en';
    const html = render([
      moment('a', '2026-09-20'), moment('b', '2026-09-21'),
      moment('c', '2026-09-29'), moment('d', '2026-10-01'),
      moment('e', '2026-10-01'),
    ]);
    expect(html).toContain('data-testid="journal-days-count">4<');
    expect(html).toContain('Days without entries are a normal part of life');
    expect(html).not.toMatch(/days in a row|Personal best|streak|reset|Flame/);
    expect(html).not.toContain('data-testid="logging-streak-count"');
    expect(html).not.toContain('data-testid="logging-best-streak"');
  });

  it.each([
    ['de', 'Dein Journal, in deinem Tempo', 'Tage ohne Eintrag'],
    ['fr', 'Ton journal, à ton rythme', 'jours sans entrée'],
    ['ar', 'سجلك على راحتك', 'والأيام بلا تسجيل عادية أيضاً'],
  ])('uses supportive copy for %s', (lang, title, gentleText) => {
    language = lang;
    const html = render([moment('a', '2026-09-29'), moment('b', '2026-10-01')]);
    expect(html).toContain(`aria-label="${title}"`);
    expect(html).toContain(gentleText);
    expect(html).toContain('data-testid="journal-days-count">2<');
  });

  it('keeps a calm Arabic RTL journal visible after a long break', () => {
    language = 'ar';
    const html = render([moment('a', '2026-08-20'), moment('b', '2026-09-01')]);
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('data-testid="journal-days-card"');
    expect(html).not.toMatch(/أفضل سلسلة|أيام متتالية|خسرت|فشل|عقوبة|ممنوع/);
    expect(html).toContain('aria-hidden="true"');
  });

  it('avoids pressuring people with only one logged day', () => {
    language = 'ar';
    expect(render([moment('a', '2026-10-01')])).not.toContain('journal-days-card');
  });
});
