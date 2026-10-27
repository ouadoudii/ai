import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('static lint quality gate', () => {
  it('keeps typechecking and ESLint as independent zero-warning CI gates', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts: Record<string, string>;
    };
    const workflow = readFileSync('.github/workflows/build-check.yml', 'utf8');
    const eslintConfig = readFileSync('eslint.config.mjs', 'utf8');

    expect(packageJson.scripts.typecheck).toBe('tsc --noEmit');
    expect(packageJson.scripts.lint).toBe('eslint . --max-warnings=0');
    expect(workflow).toContain('- name: Typecheck\n        run: npm run typecheck');
    expect(workflow).toContain('- name: Static lint\n        run: npm run lint');
    expect(eslintConfig).toContain('eslint.configs.recommended');
    expect(eslintConfig).toContain('...tseslint.configs.recommended');
  });
});
