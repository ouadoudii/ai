import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { FoodCalendarView } from './components/FoodCalendarView';

const moment = {
  id: 'keyboard-meal',
  title: 'بيض مسلوق',
  category: 'breakfast',
  date: '2026-09-30',
  time: '08:15',
  location: 'Home',
  locationCategory: 'home',
  imageUrl: '',
  rating: 4,
  mood: 'satisfied',
  tags: [],
  createdAt: 1,
};

describe('FoodCalendarView timeline accessibility', () => {
  it('renders each meal row as a native button with a stable test id', () => {
    const html = renderToStaticMarkup(
      <FoodCalendarView
        moments={[moment as any]}
        onSelectMoment={vi.fn()}
        onOpenAddModal={vi.fn()}
      />,
    );

    expect(html).toContain('<button type="button" data-testid="timeline-moment-keyboard-meal"');
    expect(html).toContain('بيض مسلوق');
  });
});
