import { describe, expect, it } from 'vitest';
import { browserSpeechLocale, voiceCopy } from './speechLanguage';

describe('speech language helpers', () => {
  it('uses the right browser recognition locale for every supported language', () => {
    expect(browserSpeechLocale('ar')).toBe('ar');
    expect(browserSpeechLocale('en')).toBe('en-US');
    expect(browserSpeechLocale('de')).toBe('de-DE');
    expect(browserSpeechLocale('fr')).toBe('fr-FR');
  });

  it('tells Arabic users that dialect speech is supported', () => {
    const copy = voiceCopy('ar');
    expect(copy.subtitle).toContain('أي لهجة عربية');
  });

  it('provides German voice capture copy instead of falling back to English', () => {
    const copy = voiceCopy('de');
    expect(copy.title).toContain('gegessen');
    expect(copy.start).toBe('Aufnahme starten');
    expect(copy.permission).toContain('Mikrofon');
  });

  it('provides native French voice capture copy', () => {
    const copy = voiceCopy('fr');
    expect(copy.title).toContain('mangé');
    expect(copy.start).toContain('enregistrement');
    expect(copy.permission).toContain('microphone');
  });
});
