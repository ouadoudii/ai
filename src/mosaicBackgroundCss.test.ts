import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const cssPath = fileURLToPath(new URL('./index.css', import.meta.url));
const css = readFileSync(cssPath, 'utf8');
const compactCss = css.replace(/\s+/g, '');

describe('Organic app-wide background', () => {
  it('replaces repeating tile wallpaper with calm gradients and readable surfaces', () => {
    expect(compactCss).toContain('--moment-bg:#f8f2e9;');
    expect(compactCss).toContain('--moment-surface:rgba(255,253,248,.96);');
    expect(compactCss).toContain('radial-gradient(ellipseat8%-8%');
    expect(compactCss).not.toContain('--moment-mosaic-');
    expect(compactCss).not.toContain('56px98px');
    expect(compactCss).not.toContain('--cary-');
  });
});
