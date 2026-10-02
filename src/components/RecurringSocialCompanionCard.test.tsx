import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '../i18n';
import type { FoodMoment } from '../types';
import { RecurringSocialCompanionCard } from './RecurringSocialCompanionCard';

const meal = (id:string, companions:string, createdAt:number): FoodMoment => ({ id, title:'بيض مسلوق', label:'Breakfast', category:'breakfast', date:'2026-10-01', time:'08:00', location:'', locationCategory:'home', imageUrl:'', mood:'satisfied', tags:[], companions, createdAt });
const moments = [meal('a','أُمّي',1), meal('b','أمي',2), meal('c','أُمّي',3)];

const renderCard = (language:'en'|'de'|'fr'|'ar', data = moments) => {
  localStorage.setItem('cary_language', language);
  return render(<LanguageProvider><RecurringSocialCompanionCard moments={data}/></LanguageProvider>);
};

describe('RecurringSocialCompanionCard', () => {
  it('surfaces the observed companion without inferring a relationship', () => {
    renderCard('en');
    expect(screen.getByTestId('recurring-social-companion-insight')).toHaveTextContent('أُمّي');
    expect(screen.getByTestId('recurring-social-companion-insight')).toHaveTextContent('3 times');
  });

  it.each([
    ['de','Ein vertrauter gemeinsamer Moment'],
    ['fr','Un moment partagé familier'],
    ['ar','لحظة مشتركة مألوفة'],
  ] as const)('localizes the insight in %s', (language, title) => {
    renderCard(language);
    expect(screen.getByText(title)).toBeInTheDocument();
  });

  it('stays hidden below the evidence threshold', () => {
    renderCard('en', moments.slice(0,2));
    expect(screen.queryByTestId('recurring-social-companion-insight')).not.toBeInTheDocument();
  });
});
