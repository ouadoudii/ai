import { describe, expect, it } from 'vitest';
import { mealEditorCopy } from './mealEditorCopy';

describe('meal draft recovery copy', () => {
  it.each(['en', 'de', 'fr', 'ar'] as const)('offers localized resume and discard actions in %s', language => {
    const copy = mealEditorCopy[language];
    expect(copy.draftTitle).toBeTruthy();
    expect(copy.draftHelp).toBeTruthy();
    expect(copy.draftResume).toBeTruthy();
    expect(copy.draftDiscard).toBeTruthy();
  });
});
