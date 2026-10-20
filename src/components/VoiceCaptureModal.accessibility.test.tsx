import React from 'react';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { LanguageProvider, type AppLanguage } from '../i18n';
import { getVoiceFocusTrapDestination, VoiceCaptureModal } from './VoiceCaptureModal';

let language: AppLanguage = 'en';
let previousStorage: unknown;

beforeAll(() => {
  previousStorage = globalThis.localStorage;
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => key === 'rhythm_language_v1' ? language : null,
      setItem: () => undefined,
    },
  });
});

afterAll(() => {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: previousStorage });
});

const renderModal = (lang: AppLanguage) => {
  language = lang;
  return renderToString(
    <LanguageProvider>
      <VoiceCaptureModal isOpen onClose={() => undefined} onBack={() => undefined} onTranscript={() => undefined} />
    </LanguageProvider>,
  );
};

describe('VoiceCaptureModal accessible dialog contract', () => {
  it.each([
    ['en', 'قل ماذا أكلت'],
    ['en', 'قل ماذا أكلت'],
    ['en', 'قل ماذا أكلت'],
    ['ar', 'قل ماذا أكلت'],
  ] as const)('uses the Arabic UI for saved %s locale and connects the heading and description to the modal', (lang, title) => {
    const html = renderModal(lang);
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="voice-capture-title"');
    expect(html).toContain('aria-describedby="voice-capture-description"');
    expect(html).toContain(`id="voice-capture-title"`);
    expect(html).toContain(title);
  });
});

describe('VoiceCaptureModal focus containment', () => {
  it('wraps both ends of the dialog', () => {
    expect(getVoiceFocusTrapDestination(true, true, true, false)).toBe('last');
    expect(getVoiceFocusTrapDestination(false, true, false, true)).toBe('first');
  });

  it('recaptures focus that starts outside and allows internal tabbing', () => {
    expect(getVoiceFocusTrapDestination(false, false, false, false)).toBe('first');
    expect(getVoiceFocusTrapDestination(true, false, false, false)).toBe('last');
    expect(getVoiceFocusTrapDestination(false, true, false, false)).toBeNull();
  });
});
