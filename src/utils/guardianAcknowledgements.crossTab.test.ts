import { describe, expect, it } from 'vitest';
import {
  GUARDIAN_ACKNOWLEDGEMENTS_STORAGE_KEY,
  acknowledgeGuardianOccurrence,
  mergeGuardianAcknowledgements,
  readGuardianAcknowledgements,
  writeGuardianAcknowledgements,
} from './guardianAcknowledgements';

describe('Guardian cross-tab dismissal safety', () => {
  it('preserves distinct dismissals from two tabs without mutating either input', () => {
    const inMemory = ['alarm-sleep-real'];
    const inStorage = ['alarm-mindless-real'];
    const merged = mergeGuardianAcknowledgements(inMemory, inStorage);
    expect(merged).toEqual(['alarm-sleep-real', 'alarm-mindless-real']);
    expect(acknowledgeGuardianOccurrence(merged, 'alarm-afternoon-real')).toEqual([
      'alarm-sleep-real', 'alarm-mindless-real', 'alarm-afternoon-real',
    ]);
    expect(inMemory).toEqual(['alarm-sleep-real']);
    expect(inStorage).toEqual(['alarm-mindless-real']);
  });

  it('deduplicates IDs and keeps the bounded newest acknowledgement history', () => {
    const inMemory = Array.from({ length: 100 }, (_, index) => `old-${index}`);
    const merged = mergeGuardianAcknowledgements(inMemory, ['old-99', 'new-100']);
    expect(merged).toHaveLength(100);
    expect(merged).not.toContain('old-0');
    expect(merged.filter((id) => id === 'old-99')).toHaveLength(1);
    expect(merged.at(-1)).toBe('new-100');
  });

  it('reads and writes the same personal key while keeping unrelated journal data untouched', () => {
    const entries = new Map<string, string>([['nimmapp_checkins_v1', '[{"id":"private"}]']]);
    const storage = {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => { entries.set(key, value); },
    };
    writeGuardianAcknowledgements(storage, ['alarm-real']);
    expect(entries.get(GUARDIAN_ACKNOWLEDGEMENTS_STORAGE_KEY)).toBe('["alarm-real"]');
    expect(readGuardianAcknowledgements(storage)).toEqual(['alarm-real']);
    expect(entries.get('nimmapp_checkins_v1')).toBe('[{"id":"private"}]');
  });

  it('allows an in-memory fallback if storage is unavailable', () => {
    const local = ['alarm-previous'];
    const next = acknowledgeGuardianOccurrence(mergeGuardianAcknowledgements(local, []), 'alarm-new');
    expect(next).toEqual(['alarm-previous', 'alarm-new']);
  });
});
