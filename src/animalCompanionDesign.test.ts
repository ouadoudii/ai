import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const css = readFileSync(fileURLToPath(new URL('./index.css', import.meta.url)), 'utf8');
const companionSvg = readFileSync(fileURLToPath(new URL('../public/moment-animal-companions.svg', import.meta.url)), 'utf8');

describe('Moment animal companions', () => {
  it('keeps the companion art integrated into the Today hero without intercepting input', () => {
    expect(css).toContain("background:url('/moment-animal-companions.svg') center/contain no-repeat;");
    expect(css).toContain('pointer-events:none;');
    expect(css).toContain('[class*="max-w-[860px]"] > section:first-child::after');
  });

  it('ships lion, fox, bear and rabbit artwork with accessible Moment metadata', () => {
    expect(companionSvg).toContain('<title id="title">Moment animal companions</title>');
    expect(companionSvg).toContain('friendly lion, fox, bear and rabbit');
    expect(companionSvg).toContain('viewBox="0 0 680 300"');
  });
});
