import { describe, expect, it } from 'vitest';
import { browserSpeechLocale, voiceCopy } from './speechLanguage';

describe('speech language helpers', () => {
  it('uses the correct browser recognition locale for every app language', () => {
    expect(browserSpeechLocale('ar')).toBe('ar-MA');
    expect(browserSpeechLocale('en')).toBe('en-US');
    expect(browserSpeechLocale('de')).toBe('de-DE');
  });

  it('provides German voice capture copy instead of falling back to English', () => {
    const copy = voiceCopy('de');
    expect(copy.title).toContain('gegessen');
    expect(copy.start).toBe('Aufnahme starten');
    expect(copy.permission).toContain('Mikrofon');
  });
});
