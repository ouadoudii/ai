import {describe,expect,it} from 'vitest';
import {resolveInitialLanguage} from './i18n';

describe('resolveInitialLanguage',()=>{
  it('uses German for first-time visitors whose browser prefers German',()=>{
    expect(resolveInitialLanguage(null,['de-DE','en-US'])).toBe('de');
  });

  it('uses Arabic when an Arabic locale is among the browser preferences',()=>{
    expect(resolveInitialLanguage(null,['fr-FR','ar-MA','en-US'])).toBe('ar');
  });

  it('keeps an explicit saved language even when the browser prefers another language',()=>{
    expect(resolveInitialLanguage('en',['de-DE'])).toBe('en');
    expect(resolveInitialLanguage('de',['ar-MA'])).toBe('de');
  });

  it('falls back to English for unsupported browser languages',()=>{
    expect(resolveInitialLanguage(null,['fr-FR','es-ES'])).toBe('en');
  });
});
