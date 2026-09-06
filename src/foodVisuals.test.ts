import {describe,expect,it} from 'vitest';
import {FOOD_VISUALS,getFoodVisuals,localizeFoodVisualName} from './utils/foodVisuals';

describe('food visual matrix',()=>{
  it('shows a rich matrix when there is no query',()=>{
    expect(getFoodVisuals('lunch','',18).length).toBeGreaterThanOrEqual(12);
  });

  it('filters visuals by English query',()=>{
    const results=getFoodVisuals('dinner','pizza');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(v=>[v.nameEn,v.nameAr,...v.keywords].join(' ').toLowerCase().includes('pizza'))).toBe(true);
  });

  it('filters visuals by Arabic query',()=>{
    const results=getFoodVisuals('dinner','طاجين');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(v=>v.nameAr.includes('طاجين'))).toBe(true);
  });

  it('localizes labels without changing the image identity',()=>{
    const visual=FOOD_VISUALS.find(v=>v.id==='pizza')!;
    expect(localizeFoodVisualName(visual,'en')).toBe('Pizza');
    expect(localizeFoodVisualName(visual,'ar')).toBe('بيتزا');
    expect(visual.imageUrl).toContain('images.unsplash.com');
  });

  it('prioritizes the selected meal category in the default matrix',()=>{
    const first=getFoodVisuals('breakfast','',6);
    expect(first.every(v=>v.category==='breakfast')).toBe(true);
  });
});