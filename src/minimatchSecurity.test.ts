import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const rootRequire = createRequire(resolve(process.cwd(), 'package.json'));
const estreeRequire = createRequire(
  resolve(process.cwd(), 'node_modules/@typescript-eslint/typescript-estree/package.json'),
);

describe('patched minimatch toolchain dependency', () => {
  it('locks every installed minimatch copy to the advisory-fixed release', () => {
    const lock = JSON.parse(readFileSync(resolve(process.cwd(), 'package-lock.json'), 'utf8')) as {
      packages: Record<string, { version?: string }>;
    };
    const copies = Object.entries(lock.packages)
      .filter(([path]) => path.endsWith('/minimatch'));
    expect(copies.length).toBeGreaterThan(0);
    for (const [, pkg] of copies) {
      expect(pkg.version).toBe('11.0.1');
    }
  });

  it.each([
    ['ESLint resolution', rootRequire],
    ['TypeScript-ESLint resolution', estreeRequire],
  ])('%s retains glob matching and exclusions', (_name, requireFrom) => {
    const { minimatch } = requireFrom('minimatch') as {
      minimatch: (path: string, pattern: string, options?: { dot?: boolean }) => boolean;
    };
    expect(minimatch('src/components/Meal.tsx', 'src/**/*.tsx')).toBe(true);
    expect(minimatch('src/components/Meal.tsx', 'src/**/*.test.tsx')).toBe(false);
    expect(minimatch('.github/workflows/ci.yaml', '**/*.yaml', { dot: true })).toBe(true);
    expect(minimatch('src/README.md', 'src/**/*.tsx')).toBe(false);
  });
});
