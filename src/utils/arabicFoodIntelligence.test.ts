import {describe,expect,it} from 'vitest';
import {foodSearchMatches,getArabFoodRegion,getRegionalFoodSeeds,normalizeArabicFoodText,resolveArabFoodAlias} from './arabicFoodIntelligence';

describe('Arabic food intelligence',()=>{
  it('normalizes Arabic spelling variants and diacritics',()=>{
    expect(normalizeArabicFoodText('  كَبْسَة ')).toBe('كبسه');
    expect(normalizeArabicFoodText('ملوخية')).toBe(normalizeArabicFoodText('ملوخيه'));
    expect(normalizeArabicFoodText('إفطار')).toBe('افطار');
  });

  it('resolves Moroccan Darija, Arabic and Latin spellings to the same food',()=>{
    expect(resolveArabFoodAlias('تاجين','MA')?.canonicalAr).toBe('طاجين');
    expect(resolveArabFoodAlias('tajine','MA')?.canonicalAr).toBe('طاجين');
    expect(resolveArabFoodAlias('رغايف','MA')?.canonicalEn).toBe('Msemen');
  });

  it('understands regional Egyptian, Levantine and Gulf foods',()=>{
    expect(resolveArabFoodAlias('كوشري','EG')?.canonicalEn).toBe('Koshari');
    expect(resolveArabFoodAlias('manaeesh','LB')?.canonicalEn).toBe('Manakish');
    expect(resolveArabFoodAlias('كبسه','SA')?.canonicalEn).toBe('Kabsa');
  });

  it('matches aliases during search',()=>{
    expect(foodSearchMatches('Moroccan tagine','تاجين','MA')).toBe(true);
    expect(foodSearchMatches('Kabsa','كبسه','SA')).toBe(true);
    expect(foodSearchMatches('Koshari','كوشري','EG')).toBe(true);
  });

  it('returns regional seeds without mixing unrelated regions first',()=>{
    expect(getArabFoodRegion('MA')).toBe('maghreb');
    expect(getRegionalFoodSeeds('AE').some(x=>x.name==='Machboos')).toBe(true);
    expect(getRegionalFoodSeeds('AE').some(x=>x.name==='Koshari')).toBe(false);
  });
});
