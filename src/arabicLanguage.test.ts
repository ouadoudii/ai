import { describe, expect, it } from 'vitest';
import { resolveInitialLanguage } from './i18n';

describe('Arabic-first language initialization', () => {
  it.each([null, 'en', 'de', 'fr', 'ar', 'unknown'])('migrates saved locale %s to Arabic UI', saved => {
    expect(resolveInitialLanguage(saved, ['de-DE', 'fr-FR'])).toBe('ar');
  });
  it('does not select a non-Arabic UI from browser locale', () => {
    expect(resolveInitialLanguage(null, ['en-US', 'fr-MA', 'ar-MA'])).toBe('ar');
  });
});
