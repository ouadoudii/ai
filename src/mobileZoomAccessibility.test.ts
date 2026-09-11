import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('mobile zoom accessibility', () => {
  it('keeps browser pinch zoom enabled on mobile', () => {
    const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    const viewport = html.match(/<meta\s+name="viewport"\s+content="([^"]+)"/i)?.[1] ?? '';

    expect(viewport).toContain('width=device-width');
    expect(viewport).toContain('initial-scale=1.0');
    expect(viewport).not.toMatch(/maximum-scale\s*=\s*1/i);
    expect(viewport).not.toMatch(/user-scalable\s*=\s*no/i);
  });
});
