import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const css = readFileSync(fileURLToPath(new URL('./index.css', import.meta.url)), 'utf8');
const companionSvg = readFileSync(fileURLToPath(new URL('../public/moment-animal-companions.svg', import.meta.url)), 'utf8');

describe('Legacy animal artwork is not injected into the Arabic-first home', () => {
  it('keeps unrelated animal artwork out of the Today hero and interactive layers', () => {
    expect(css).not.toContain("background:url('/moment-animal-companions.svg')");
    expect(css).not.toContain('[class*="max-w-[860px]"] > section:first-child::after');
    expect(css).toContain(':focus-visible{outline:3px solid var(--moment-focus)');
  });

  it('ships lion, fox, bear and wolf artwork with accessible Moment metadata', () => {
    expect(companionSvg).toContain('<title id="title">Moment animal companions</title>');
    expect(companionSvg).toContain('friendly lion, fox, bear and wolf');
    expect(companionSvg).not.toContain('rabbit');
    expect(companionSvg).toContain('viewBox="0 0 680 300"');
  });
});
