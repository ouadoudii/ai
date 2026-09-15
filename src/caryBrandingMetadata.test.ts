import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const indexPath = fileURLToPath(new URL('../index.html', import.meta.url));
const html = readFileSync(indexPath, 'utf8');

describe('Moment browser branding', () => {
  it('uses Moment consistently in title, social metadata and boot copy', () => {
    expect(html).toContain('<title>Moment — Food, Sleep & Everyday Rhythm</title>');
    expect(html).toContain('content="Moment helps you capture food, sleep, energy and wellbeing');
    expect(html).toContain('<meta property="og:title" content="Moment" />');
    expect(html).toContain('Moment is loading…');
    expect(html).not.toContain('<title>Cary');
    expect(html).not.toContain('content="Cary helps');
    expect(html).not.toContain('Cary is loading…');
  });
});
