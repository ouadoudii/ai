import { describe, expect, it } from 'vitest';
import { browserSpeechLocale, voiceCopy } from './speechLanguage';

describe('speech language helpers', () => {
  it('uses a generic Arabic browser recognition locale so fallback speech is not Morocco-only', () => {
    expect(browserSpeechLocale('ar')).toBe('ar');
    expect(browserSpeechLocale('en')).toBe('en-US');
    expect(browserSpeechLocale('de')).toBe('de-DE');
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
});
