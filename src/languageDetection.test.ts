import {describe,expect,it} from 'vitest';
import {resolveInitialLanguage} from './i18n';

describe('resolveInitialLanguage',()=>{
  it('uses German for first-time visitors whose browser prefers German',()=>{
    expect(resolveInitialLanguage(null,['de-DE','en-US'])).toBe('de');
  });

  it('uses French for first-time visitors whose browser prefers French',()=>{
    expect(resolveInitialLanguage(null,['fr-FR','en-US'])).toBe('fr');
  });

  it('respects browser preference order when multiple supported languages are present',()=>{
    expect(resolveInitialLanguage(null,['ar-MA','fr-FR','de-DE','en-US'])).toBe('ar');
    expect(resolveInitialLanguage(null,['fr-FR','ar-MA','de-DE','en-US'])).toBe('fr');
    expect(resolveInitialLanguage(null,['de-DE','fr-FR','ar-MA','en-US'])).toBe('de');
    expect(resolveInitialLanguage(null,['en-US','fr-FR','ar-MA','de-DE'])).toBe('en');
  });

  it('keeps an explicit saved language even when the browser prefers another language',()=>{
    expect(resolveInitialLanguage('en',['de-DE'])).toBe('en');
    expect(resolveInitialLanguage('de',['ar-MA'])).toBe('de');
    expect(resolveInitialLanguage('fr',['en-US'])).toBe('fr');
  });

  it('falls back to English for unsupported browser languages',()=>{
    expect(resolveInitialLanguage(null,['es-ES','it-IT'])).toBe('en');
  });
});
