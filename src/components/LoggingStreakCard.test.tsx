import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { FoodMoment } from '../types';
import { LoggingStreakCard } from './LoggingStreakCard';

let language = 'en';
vi.mock('../i18n', () => ({ useLanguage: () => ({ language }) }));

const moment = (id:string,date:string):FoodMoment => ({ id, title:'Meal', category:'breakfast', date, time:'08:00', createdAt:1 } as FoodMoment);
const history = [moment('a','2026-09-29'), moment('b','2026-09-30'), moment('c','2026-10-01')];

describe('LoggingStreakCard', () => {
  it('shows the derived streak without judging the meals', () => {
    language='en'; render(<LoggingStreakCard moments={history}/>);
    expect(screen.getByTestId('logging-streak-count')).toHaveTextContent('3');
    expect(screen.getByText(/days in a row/i)).toBeInTheDocument();
  });
  it.each([
    ['de','Dein Erfassungsrhythmus'],
    ['fr','Ton rythme de suivi'],
    ['ar','إيقاع تسجيلك'],
  ])('localizes the card for %s', (lang,title) => {
    language=lang; render(<LoggingStreakCard moments={history}/>);
    expect(screen.getByLabelText(title)).toBeInTheDocument();
  });
  it('stays hidden until a meaningful multi-day streak exists', () => {
    language='en'; render(<LoggingStreakCard moments={[moment('a','2026-10-01')]}/>);
    expect(screen.queryByTestId('logging-streak-card')).not.toBeInTheDocument();
  });
});
