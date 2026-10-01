import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { FoodMoment } from '../types';
import { LoggingStreakCard } from './LoggingStreakCard';

let language = 'en';
vi.mock('../i18n', () => ({ useLanguage: () => ({ language }) }));

const moment = (id:string,date:string):FoodMoment => ({ id, title:'Meal', category:'breakfast', date, time:'08:00', createdAt:1 } as FoodMoment);
const history = [moment('a','2026-09-29'), moment('b','2026-09-30'), moment('c','2026-10-01')];

const render = (moments:FoodMoment[]) => renderToStaticMarkup(<LoggingStreakCard moments={moments}/>);

describe('LoggingStreakCard', () => {
  it('shows the derived streak without judging the meals', () => {
    language='en'; const html=render(history);
    expect(html).toContain('data-testid="logging-streak-count">3<');
    expect(html).toMatch(/days in a row/i);
  });
  it.each([
    ['de','Dein Erfassungsrhythmus'],
    ['fr','Ton rythme de suivi'],
    ['ar','إيقاع تسجيلك'],
  ])('localizes the card for %s', (lang,title) => {
    language=lang; const html=render(history);
    expect(html).toContain(`aria-label="${title}"`);
  });
  it('stays hidden until a meaningful multi-day streak exists', () => {
    language='en'; const html=render([moment('a','2026-10-01')]);
    expect(html).not.toContain('data-testid="logging-streak-card"');
  });
});
