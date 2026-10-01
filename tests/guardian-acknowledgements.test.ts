import { describe, expect, it } from 'vitest';
import {
  acknowledgeGuardianOccurrence,
  readGuardianAcknowledgements,
  writeGuardianAcknowledgements,
} from '../src/utils/guardianAcknowledgements';

describe('guardian acknowledgement persistence', () => {
  it('keeps a dismissed occurrence acknowledged across storage reloads', () => {
    let value: string | null = null;
    const storage = {
      getItem: () => value,
      setItem: (_key: string, next: string) => { value = next; },
    };

    const next = acknowledgeGuardianOccurrence([], 'alarm-2026-10-01-lunch');
    writeGuardianAcknowledgements(storage, next);

    expect(readGuardianAcknowledgements(storage)).toEqual(['alarm-2026-10-01-lunch']);
  });

  it('does not duplicate the same occurrence and allows a new occurrence id', () => {
    const first = acknowledgeGuardianOccurrence([], 'low-energy-1');
    const repeated = acknowledgeGuardianOccurrence(first, 'low-energy-1');
    const later = acknowledgeGuardianOccurrence(repeated, 'low-energy-2');

    expect(repeated).toEqual(['low-energy-1']);
    expect(later).toEqual(['low-energy-1', 'low-energy-2']);
  });

  it('fails closed on corrupt persisted data', () => {
    expect(readGuardianAcknowledgements({ getItem: () => '{bad json' })).toEqual([]);
  });
});
