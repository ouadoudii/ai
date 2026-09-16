import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';

const componentsDir = new URL('./components/', import.meta.url);

describe('Moment component branding', () => {
  it('does not keep legacy Cary-named React components', () => {
    const componentFiles = readdirSync(componentsDir);
    expect(componentFiles.filter((name) => /^Cary.*\.tsx$/.test(name))).toEqual([]);
  });
});
