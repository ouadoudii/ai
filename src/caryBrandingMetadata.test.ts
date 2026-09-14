import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const indexPath = fileURLToPath(new URL('../index.html', import.meta.url));
const html = readFileSync(indexPath, 'utf8');

describe('Cary browser branding', () => {
  it('uses Cary consistently in title, social metadata and boot copy', () => {
    expect(html).toContain('<title>Cary — Food, Sleep & Everyday Rhythm</title>');
    expect(html).toContain('content="Cary helps you capture food, sleep, energy and wellbeing');
    expect(html).toContain('<meta property="og:title" content="Cary" />');
    expect(html).toContain('Cary is loading…');
    expect(html).not.toContain('<title>Rhythm');
    expect(html).not.toContain('content="Rhythm helps');
  });
});
