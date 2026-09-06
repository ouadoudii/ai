import {describe,expect,it} from 'vitest';
import {addMealItem,buildMealTitle,normalizeMealItem,removeMealItem} from './utils/mealItems';

describe('multi-item meal entry',()=>{
  it('adds several foods without duplicates',()=>{
    let items:string[]=[];
    items=addMealItem(items,' Bread ');
    items=addMealItem(items,'Olives');
    items=addMealItem(items,'bread');
    expect(items).toEqual(['Bread','Olives']);
  });

  it('keeps pending text when meal is saved without pressing check',()=>{
    expect(buildMealTitle(['Bread','Olives'],' Mint tea ')).toBe('Bread · Olives · Mint tea');
  });

  it('removes individual chips',()=>{
    expect(removeMealItem(['Bread','Olives','Tea'],1)).toEqual(['Bread','Tea']);
  });

  it('normalizes repeated whitespace',()=>{
    expect(normalizeMealItem('  grilled   fish  ')).toBe('grilled fish');
  });

  it('works with Arabic meal items',()=>{
    expect(buildMealTitle(['خبز','زيتون'],'شاي بالنعناع')).toBe('خبز · زيتون · شاي بالنعناع');
  });
});