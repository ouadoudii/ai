import {describe,expect,it} from 'vitest';
import {resolveInitialLanguage} from './i18n';

describe('Arabic-only product UI locale resolution', () => {
  it.each([
    [null, ['de-DE','en-US']],
    [null, ['fr-FR','en-US']],
    [null, ['en-US','ar-MA']],
    [null, ['es-ES','it-IT']],
    ['en', ['de-DE']],
    ['de', ['ar-MA']],
    ['fr', ['en-US']],
    ['ar', ['fr-FR']],
  ] as const)('uses Arabic regardless of persisted locale or browser languages', (saved, locales) => {
    expect(resolveInitialLanguage(saved, [...locales])).toBe('ar');
  });
});
