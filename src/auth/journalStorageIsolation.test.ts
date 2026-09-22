import { describe, expect, it, vi } from 'vitest';
import { clearUnscopedJournalStorage, JOURNAL_STORAGE_KEYS } from './journalStorageIsolation';

describe('journal storage isolation', () => {
  it('removes every current and legacy unscoped journal key at an identity boundary', () => {
    const removeItem = vi.fn();
    clearUnscopedJournalStorage({ removeItem });
    expect(removeItem.mock.calls.map(([key]) => key)).toEqual([...JOURNAL_STORAGE_KEYS]);
  });

  it('does not touch unrelated device preferences', () => {
    const removed: string[] = [];
    clearUnscopedJournalStorage({ removeItem: key => removed.push(key) });
    expect(removed).not.toContain('cary_language_v1');
    expect(removed).not.toContain('cary_access_mode_v1');
    expect(removed).not.toContain('cary_intro_profile_v1');
  });
});
