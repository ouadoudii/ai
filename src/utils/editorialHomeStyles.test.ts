import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('Arabic editorial home design', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8');
  it('retains an RTL-friendly spacious two-column desktop composition', () => {
    expect(css).toContain('.rhythm-organic-hero > div.relative');
    expect(css).toContain('grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr)');
    expect(css).toContain('@media (min-width: 1024px)');
  });
  it('keeps voice capture visually prominent and reduced-motion accessible', () => {
    expect(css).toContain('[data-testid="voice-home-mic"]');
    expect(css).toContain('min-height: 200px');
    expect(css).toContain('@media(prefers-reduced-motion:reduce)');
  });
});
