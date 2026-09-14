import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const cssPath = fileURLToPath(new URL('./index.css', import.meta.url));
const css = readFileSync(cssPath, 'utf8');

describe('Cary mosaic background', () => {
  it('keeps the decorative mosaic subtle and behind readable surfaces', () => {
    expect(css).toContain('--cary-mosaic-line: rgba(120, 91, 72, .055);');
    expect(css).toContain('--cary-mosaic-coral: rgba(240, 111, 95, .055);');
    expect(css).toContain('--cary-mosaic-green: rgba(53, 107, 91, .045);');
    expect(css).toContain('56px 98px');
    expect(css).toContain('--cary-surface: rgba(255,255,255,.94);');
  });
});
