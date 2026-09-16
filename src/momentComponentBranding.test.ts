import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

describe('Moment component branding', () => {
  it('does not keep legacy Cary-named React components', () => {
    const componentFiles = readdirSync(join(here, 'components'));
    expect(componentFiles.filter((name) => /^Cary.*\.tsx$/.test(name))).toEqual([]);
  });
});
