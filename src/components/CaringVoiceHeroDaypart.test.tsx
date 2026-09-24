import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('./CaringVoiceHero.tsx', import.meta.url), 'utf8');

describe('CaringVoiceHero current daypart lifecycle', () => {
  it('refreshes the visible prompt when the app regains focus or visibility', () => {
    expect(source).toContain("window.addEventListener('focus', refreshCaringPrompt)");
    expect(source).toContain("document.addEventListener('visibilitychange', refreshOnVisible)");
    expect(source).toContain("document.visibilityState === 'visible'");
  });

  it('resolves a fresh prompt at submission time instead of sending mount-time context', () => {
    expect(source).toContain('const currentPrompt = refreshCaringPrompt();');
    expect(source).toContain('processVoiceCheckIn(text, currentPrompt.timeSlot, archetype)');
    expect(source).not.toContain('processVoiceCheckIn(text, caringPrompt.timeSlot, archetype)');
  });

  it('refreshes before a new microphone interaction and cleans up listeners', () => {
    expect(source).toContain("window.removeEventListener('focus', refreshCaringPrompt)");
    expect(source).toContain("document.removeEventListener('visibilitychange', refreshOnVisible)");
    expect(source.match(/const currentPrompt = refreshCaringPrompt\(\);/g)?.length).toBeGreaterThanOrEqual(2);
  });
});
