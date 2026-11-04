import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Guard the desktop-first layout contract independently of the browser E2E suite.
// Browser tests verify the actual geometry; this test catches accidental removal
// of the responsive structure before expensive browser tests run.
const source = readFileSync(new URL('./TodayHomeView.tsx', import.meta.url), 'utf8');

describe('Today Arabic RTL home responsive layout', () => {
  it('constrains desktop content width and avoids a forced tall desktop hero', () => {
    expect(source).toContain('max-w-[1180px]');
    expect(source).toContain('lg:min-h-0');
    expect(source).toContain('data-testid="today-organic-hero"');
  });

  it('keeps daily actions single-column on phones and two-column on desktop', () => {
    expect(source).toContain('grid-cols-1');
    expect(source).toContain('lg:grid-cols-2');
    expect(source).toContain('data-testid={`today-phase-${p.key}`}');
  });

  it('preserves the primary accessible voice action and RTL-aware text alignment', () => {
    expect(source).toContain('data-testid="voice-home-mic"');
    expect(source).toContain('onClick={openVoice}');
    expect(source).toContain('text-start');
  });
});
