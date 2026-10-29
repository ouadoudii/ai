import { describe, expect, it } from 'vitest';
import { getOnboardingWeightSelection, sanitizeOnboardingWeightInput, parseOnboardingWeight, PROFILE_INTRO_KEY, shouldShowVoiceFirstEntry, voiceFirstEntryCopy } from '../src/components/VoiceFirstEntryOverlay';

describe('quick onboarding form guards', () => {
  it('restores the caret after the first digit without breaking deliberate edits', () => {
    // Some Chromium input events report 0 before the native caret advances.
    expect(getOnboardingWeightSelection('8', 0, '')).toBe(1);
    expect(getOnboardingWeightSelection('٨', 0, '')).toBe(1);
    expect(getOnboardingWeightSelection('82', 0, '')).toBe(2);
    expect(getOnboardingWeightSelection('782', 1, '82')).toBe(1);
    expect(getOnboardingWeightSelection('82', 1, '782')).toBe(1);
  });

  it('sanitizes unsupported characters without reordering Arabic or Persian numerals', () => {
    expect(sanitizeOnboardingWeightInput('٧٢٫٥')).toBe('٧٢٫٥');
    expect(sanitizeOnboardingWeightInput('۷۲٫۵')).toBe('۷۲٫۵');
    expect(sanitizeOnboardingWeightInput(' 72x,5 ')).toBe('72,5');
    expect(getOnboardingWeightSelection('7x2', 3, '7')).toBe(2);
  });

  it('normalizes supported decimal weights and rejects malformed values', () => {
    expect(parseOnboardingWeight('72,5')).toBe(72.5);
    expect(parseOnboardingWeight('72.5')).toBe(72.5);
    expect(parseOnboardingWeight('٨٢٫٥')).toBe(82.5);
    expect(parseOnboardingWeight('۸۲٫۵')).toBe(82.5);
    expect(parseOnboardingWeight('72,,5')).toBeNull();
    expect(parseOnboardingWeight('72,5.3')).toBeNull();
  });

  it('keeps onboarding hidden once a profile has been persisted', () => {
    const emptyStorage = { getItem: () => null };
    const profiledStorage = { getItem: (key: string) => key === PROFILE_INTRO_KEY ? '{"summary":"ready"}' : null };
    expect(shouldShowVoiceFirstEntry(emptyStorage)).toBe(true);
    expect(shouldShowVoiceFirstEntry(profiledStorage)).toBe(false);
  });
  it('uses the Arabic ريثم brand throughout the live quick form', () => {
    const copy = voiceFirstEntryCopy('ar');
    expect(copy.formHelp).toContain('ريثم');
    expect(copy.save).toBe('ابدأ مع ريثم');
    expect(JSON.stringify(copy)).not.toContain('Moment');
  });
});
