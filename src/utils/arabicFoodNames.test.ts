import {describe,expect,it} from 'vitest';
import {localizeStoredFoodName} from './arabicFoodNames';

describe('stored food localization',()=>{
  it('translates Arabic coffee back to English',()=>{
    expect(localizeStoredFoodName('قهوة','coffee','en')).toBe('Coffee');
  });
  it('translates regional Arabic aliases back to English',()=>{
    expect(localizeStoredFoodName('تاجين','lunch','en')).toContain('tagine');
    expect(localizeStoredFoodName('كبسه','lunch','en')).toBe('Kabsa');
  });
  it('never leaks unknown Arabic food text into English UI',()=>{
    expect(localizeStoredFoodName('طبق غير معروف','dinner','en')).toBe('Dinner');
  });
});
