import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { FoodMoment } from '../types';
import { MomentCard } from './MomentCard';
import { MomentDetailModal } from './MomentDetailModal';

vi.mock('../i18n', () => ({ useLanguage: () => ({ language: 'ar' }) }));

const meal: FoodMoment = {
  id: 'meal-1', title: 'حريرة مع الخبز', label: 'الغداء', category: 'lunch',
  date: '2026-10-30', time: '12:00', location: 'البيت',
  locationCategory: 'home', imageUrl: '', tags: [],
  createdAt: 1,
};
const noop = () => undefined;
const card = (moment: FoodMoment) => renderToStaticMarkup(
  <MomentCard moment={moment} onSelect={noop} onEdit={noop} onDelete={noop} onToggleFavorite={noop} />,
);
const detail = (moment: FoodMoment) => renderToStaticMarkup(
  <MomentDetailModal moment={moment} onClose={noop} onEdit={noop} onDelete={noop} onToggleFavorite={noop} />,
);

describe('unrated meals remain truthful in Arabic timeline and detail', () => {
  it('does not show decorative stars or undefined/5 for a meal without a rating', () => {
    expect(card(meal)).not.toContain('تقييم الوجبة:');
    expect(card(meal)).not.toContain('الشعور:');
    const html = detail(meal);
    expect(html).toContain('data-testid="moment-detail-rating"');
    expect(html).toContain('غير محدد');
    expect(html).not.toContain('undefined/5');
  });

  it('shows only a genuine existing rating and keeps its value', () => {
    const rated = { ...meal, rating: 4, mood: 'satisfied' as const };
    expect(card(rated)).toContain('تقييم الوجبة: 4 من 5');
    expect(card(rated)).toContain('الشعور:');
    expect(detail(rated)).toContain('4/5');
  });
});
