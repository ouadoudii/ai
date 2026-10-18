import React from 'react';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { LanguageProvider, type AppLanguage } from '../i18n';
import { AddMomentModal, getMealEditorFocusDestination } from './AddMomentModal';

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
      <AddMomentModal isOpen onClose={() => undefined} onBack={() => undefined} onSave={() => undefined} />
    </LanguageProvider>,
  );
};

describe('AddMomentModal accessible dialog contract', () => {
  it.each([
    ['en', 'What did you have?'],
    ['de', 'Was hast du gegessen?'],
    ['fr', 'Qu’as-tu mangé ?'],
    ['ar', 'ماذا أكلت؟'],
  ] as const)('connects the localized %s heading to the modal', (lang, title) => {
    const html = renderModal(lang);
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="meal-editor-title"');
    expect(html).toContain('id="meal-editor-title"');
    expect(html).toContain(title);
  });
});

describe('AddMomentModal focus containment', () => {
  it('wraps both ends of the editor', () => {
    expect(getMealEditorFocusDestination(true, true, true, false)).toBe('last');
    expect(getMealEditorFocusDestination(false, true, false, true)).toBe('first');
  });

  it('recaptures escaped focus and allows internal tabbing', () => {
    expect(getMealEditorFocusDestination(false, false, false, false)).toBe('first');
    expect(getMealEditorFocusDestination(true, false, false, false)).toBe('last');
    expect(getMealEditorFocusDestination(false, true, false, false)).toBeNull();
  });
});
