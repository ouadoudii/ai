import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { MomentDetailModal } from './components/MomentDetailModal';

const moment = {
  id: 'favorite-a11y',
  title: 'Harira accessibility',
  label: 'Meal',
  category: 'dinner',
  date: '2026-09-28',
  time: '19:00',
  location: 'Home',
  imageUrl: '',
  rating: 5,
  mood: 'satisfied',
  tags: [],
  createdAt: 1,
};

const renderFavorite = (isFavorite: boolean) => renderToStaticMarkup(
  <MomentDetailModal
    moment={{ ...moment, isFavorite } as any}
    onClose={vi.fn()}
    onEdit={vi.fn()}
    onDelete={vi.fn()}
    onToggleFavorite={vi.fn()}
  />,
);

describe('MomentDetailModal favorite accessibility state', () => {
  it('exposes the unfavorited state as aria-pressed=false', () => {
    expect(renderFavorite(false)).toContain('aria-label="Favorite" aria-pressed="false"');
  });

  it('exposes the favorited state as aria-pressed=true', () => {
    expect(renderFavorite(true)).toContain('aria-label="Favorite" aria-pressed="true"');
  });
});
