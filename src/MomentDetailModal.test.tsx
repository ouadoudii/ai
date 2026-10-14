import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { copyMealShareText, MomentDetailModal } from './components/MomentDetailModal';

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

describe('MomentDetailModal clipboard sharing', () => {
  it('waits for a successful clipboard write', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    await expect(copyMealShareText('Harira · Dinner', { writeText } as any)).resolves.toBeUndefined();
    expect(writeText).toHaveBeenCalledOnce();
    expect(writeText).toHaveBeenCalledWith('Harira · Dinner');
  });

  it('propagates clipboard rejection instead of claiming success', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    await expect(copyMealShareText('Harira · Dinner', { writeText } as any)).rejects.toThrow('denied');
  });

  it('treats a missing Clipboard API as a failure', async () => {
    await expect(copyMealShareText('Harira · Dinner', undefined)).rejects.toThrow('clipboard-unavailable');
  });
});
