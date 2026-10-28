import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { FoodMoment } from '../types';
import { FoodCalendarView } from './FoodCalendarView';

vi.mock('../i18n', () => ({ useLanguage: () => ({ language: 'ar' }) }));

const meal: FoodMoment = {
  id: 'harira', title: 'حريرة Harira', label: 'عشاء', category: 'dinner',
  date: '2026-09-30', time: '19:00', location: 'الرباط',
  locationCategory: 'home', imageUrl: '', rating: 5, mood: 'comfort',
  tags: ['Darija'], nutrition: { calories: 860 }, createdAt: 1,
};

const render = (moments: FoodMoment[]) => renderToStaticMarkup(
  <FoodCalendarView moments={moments} onSelectMoment={() => {}} onOpenAddModal={() => {}} />,
);

describe('calm Arabic meal journal', () => {
  it('preserves real mixed-script meal history without unrequested calorie or rating scoreboards', () => {
    const html = render([meal]);
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('حريرة Harira');
    expect(html).toContain('data-testid="timeline-moment-harira"');
    expect(html).toContain('aria-label="طعام مريح"');
    expect(html).not.toMatch(/kcal|lucide-flame|lucide-star|~860/);
    expect(html).not.toContain('>5</span>');
    expect(meal.nutrition?.calories).toBe(860);
    expect(meal.rating).toBe(5);
  });

  it('invites a first entry gently instead of showing an empty, judgmental screen', () => {
    const html = render([]);
    expect(html).toContain('data-testid="timeline-empty-journal"');
    expect(html).toContain('يومياتك هنا متى أحببت');
    expect(html).toContain('سجّل وجبة حين يناسبك');
    expect(html).toContain('إضافة تدوينة');
    expect(html).not.toMatch(/فشل|عقوبة|خسرت|أيام متتالية|kcal/);
  });
});
