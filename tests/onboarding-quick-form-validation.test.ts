import { describe, expect, it } from 'vitest';
import { parseOnboardingWeight, PROFILE_INTRO_KEY, shouldShowVoiceFirstEntry } from '../src/components/VoiceFirstEntryOverlay';

describe('quick onboarding form guards', () => {
  it('normalizes supported decimal weights and rejects malformed values', () => {
    expect(parseOnboardingWeight('72,5')).toBe(72.5);
    expect(parseOnboardingWeight('72.5')).toBe(72.5);
    expect(parseOnboardingWeight('72,,5')).toBeNull();
    expect(parseOnboardingWeight('72,5.3')).toBeNull();
  });

  it('keeps onboarding hidden once a profile has been persisted', () => {
    const emptyStorage = { getItem: () => null };
    const profiledStorage = { getItem: (key: string) => key === PROFILE_INTRO_KEY ? '{"summary":"ready"}' : null };
    expect(shouldShowVoiceFirstEntry(emptyStorage)).toBe(true);
    expect(shouldShowVoiceFirstEntry(profiledStorage)).toBe(false);
  });
});
