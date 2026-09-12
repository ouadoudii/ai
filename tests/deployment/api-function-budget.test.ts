import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const apiDir = resolve(here, '../../api');

describe('Vercel API function budget', () => {
  it('keeps test files out of the deployable api directory', () => {
    const apiFiles = readdirSync(apiDir).filter(name => name.endsWith('.ts'));
    const accidentalTests = apiFiles.filter(name => /\.(test|spec)\.ts$/.test(name));
    expect(accidentalTests).toEqual([]);
  });

  it('keeps headroom below the Hobby function limit', () => {
    const apiFiles = readdirSync(apiDir).filter(name => name.endsWith('.ts'));
    expect(apiFiles.length).toBeLessThanOrEqual(10);
  });
});
