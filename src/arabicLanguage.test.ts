import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { isSupportedUiLanguage, LanguageProvider, resolveInitialLanguage, useLanguage } from './i18n';

describe('Arabic-first language initialization', () => {
  it.each([null, 'en', 'de', 'fr', 'ar', 'unknown'])('migrates saved locale %s to Arabic UI', saved => {
    expect(resolveInitialLanguage(saved, ['de-DE', 'fr-FR'])).toBe('ar');
  });
  it('does not select a non-Arabic UI from browser locale', () => {
    expect(resolveInitialLanguage(null, ['en-US', 'fr-MA', 'ar-MA'])).toBe('ar');
  });

  it('rejects legacy runtime locale requests while allowing Arabic', () => {
    expect(isSupportedUiLanguage('ar')).toBe(true);
    for (const legacy of ['en', 'de', 'fr'] as const) {
      expect(isSupportedUiLanguage(legacy)).toBe(false);
    }
  });

  it('keeps the context translation Arabic even with a legacy saved preference', () => {
    const originalStorage = (globalThis as { localStorage?: Storage }).localStorage;
    (globalThis as { localStorage?: Storage }).localStorage = {
      getItem: () => 'fr',
      setItem: () => {},
    } as unknown as Storage;
    try {
      const Probe = () => React.createElement('span', null, useLanguage().t('today'));
      const html = renderToString(
        React.createElement(LanguageProvider, null, React.createElement(Probe)),
      );
      expect(html).toContain('اليوم');
      expect(html).not.toContain('Today');
      expect(html).not.toContain('Aujourd');
    } finally {
      (globalThis as { localStorage?: Storage }).localStorage = originalStorage;
    }
  });
});
