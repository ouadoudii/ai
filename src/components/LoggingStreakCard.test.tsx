import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { FoodMoment } from '../types';
import { LoggingStreakCard } from './LoggingStreakCard';

let language = 'en';
vi.mock('../i18n', () => ({ useLanguage: () => ({ language }) }));

const moment = (id:string,date:string):FoodMoment => ({ id, title:'Meal', category:'breakfast', date, time:'08:00', createdAt:1 } as FoodMoment);
const history = [moment('a','2026-09-29'), moment('b','2026-09-30'), moment('c','2026-10-01')];
const bestHistory = [moment('a','2026-09-20'), moment('b','2026-09-21'), moment('c','2026-09-22'), moment('d','2026-09-30'), moment('e','2026-10-01')];

const render = (moments:FoodMoment[]) => renderToStaticMarkup(<LoggingStreakCard moments={moments}/>);

describe('LoggingStreakCard', () => {
  it('shows the derived streak and personal best without judging the meals', () => {
    language='en'; const html=render(bestHistory);
    expect(html).toContain('data-testid="logging-streak-count">2<');
    expect(html).toContain('data-testid="logging-best-streak-count">3<');
    expect(html).toMatch(/Personal best/);
  });
  it.each([
    ['de','Dein Erfassungsrhythmus','Persönlicher Bestwert'],
    ['fr','Ton rythme de suivi','Meilleure série'],
    ['ar','إيقاع تسجيلك','أفضل سلسلة شخصية'],
  ])('localizes the card and best label for %s', (lang,title,best) => {
    language=lang; const html=render(history);
    expect(html).toContain(`aria-label="${title}"`);
    expect(html).toContain(best);
  });
  it('keeps a meaningful historical best visible after the current streak resets', () => {
    language='en'; const html=render([moment('a','2026-09-20'), moment('b','2026-09-21'), moment('c','2026-09-22'), moment('d','2026-10-01')]);
    expect(html).toContain('data-testid="logging-streak-card"');
    expect(html).not.toContain('data-testid="logging-streak-count"');
    expect(html).toContain('data-testid="logging-best-streak-count">3<');
  });
  it('stays hidden until a meaningful multi-day history exists', () => {
    language='en'; const html=render([moment('a','2026-10-01')]);
    expect(html).not.toContain('data-testid="logging-streak-card"');
  });
});
