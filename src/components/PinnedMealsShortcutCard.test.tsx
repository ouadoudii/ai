import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach,describe,expect,it,vi } from 'vitest';
import { PinnedMealsShortcutCard } from './PinnedMealsShortcutCard';
import { PINNED_MEALS_STORAGE_KEY } from '../pinnedMeals';

let language='en';
vi.mock('../i18n',()=>({useLanguage:()=>({language})}));
const meal={id:'real-1',title:'بيض مسلوق · Pain complet',category:'breakfast',tags:[],createdAt:1} as never;

describe('PinnedMealsShortcutCard',()=>{
  beforeEach(()=>{vi.stubGlobal('localStorage',{getItem:(key:string)=>key===PINNED_MEALS_STORAGE_KEY?JSON.stringify(['real-1']):null});});

  it.each([
    ['en','Pinned meals','Use again'],
    ['de','Angeheftete Mahlzeiten','Erneut verwenden'],
    ['fr','Repas épinglés','Réutiliser'],
    ['ar','الوجبات المثبّتة','استخدمها مجدداً'],
  ])('shows the stable shortcut with neutral %s copy',(locale,title,action)=>{
    language=locale;
    const html=renderToStaticMarkup(<PinnedMealsShortcutCard moments={[meal]} onRepeatMeal={()=>undefined}/>);
    expect(html).toContain(title);
    expect(html).toContain(action);
    expect(html).toContain('بيض مسلوق · Pain complet');
  });

  it('stays optional when no eligible pinned meal resolves',()=>{
    const html=renderToStaticMarkup(<PinnedMealsShortcutCard moments={[]} onRepeatMeal={()=>undefined}/>);
    expect(html).not.toContain('pinned-meals-shortcuts');
  });
});
