import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { FoodMoment } from '../types';
import { MealFrequencyInsightCard } from './MealFrequencyInsightCard';

let language='en';
vi.mock('../i18n',()=>({useLanguage:()=>({language})}));
vi.mock('../utils/dateKey',()=>({getLocalDateKey:()=> '2026-10-02'}));
const meal=(id:string,title:string,date:string):FoodMoment=>({id,title,category:'breakfast',date,time:'08:00',createdAt:1} as FoodMoment);
const history=[meal('a','بيض مسلوق','2026-09-28'),meal('b','بيض مسلوق','2026-09-30'),meal('c','بيض مسلوق','2026-10-02')];
const render=()=>renderToStaticMarkup(<MealFrequencyInsightCard moments={history}/>);

describe('MealFrequencyInsightCard',()=>{
  it('shows the factual seven-day frequency without nutrition judgement',()=>{language='en';const html=render();expect(html).toContain('data-testid="meal-frequency-insight"');expect(html).toContain('بيض مسلوق');expect(html).toContain('3 times');});
  it.each([['de','Ein Rhythmus, der sich wiederholt'],['fr','Un rythme qui se répète'],['ar','إيقاع تكرر عندك']])('localizes the insight for %s',(lang,title)=>{language=lang;expect(render()).toContain(`aria-label="${title}"`);});
  it('stays hidden before three occurrences',()=>{language='en';const html=renderToStaticMarkup(<MealFrequencyInsightCard moments={history.slice(0,2)}/>);expect(html).not.toContain('data-testid="meal-frequency-insight"');});
});