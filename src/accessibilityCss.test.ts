import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const cssPath = fileURLToPath(new URL('./index.css', import.meta.url));
const css = readFileSync(cssPath, 'utf8');
const compactCss = css.replace(/\s+/g, '');

describe('Moment motion accessibility', () => {
  it('respects the operating system reduced-motion preference', () => {
    expect(compactCss).toContain('@media(prefers-reduced-motion:reduce)');
    expect(compactCss).toContain('animation-duration:.01ms!important;');
    expect(compactCss).toContain('animation-iteration-count:1!important;');
    expect(compactCss).toContain('transition-duration:.01ms!important;');
    expect(compactCss).toContain('scroll-behavior:auto!important;');
  });
});
