import { describe, expect, it } from 'vitest';
import { assertFactoryContract, prepareGeneratedFiles } from '../server/lib/contract';
import type { AppBlueprint } from '../server/lib/openai';

function blueprint(): AppBlueprint {
  return {
    appName: 'Quote Pilot',
    repoName: 'quote-pilot',
    summary: 'Turns job photos into draft quotes for small contractors.',
    testScenarios: ['create quote', 'edit line item', 'mobile flow'],
    files: [
      { path: 'package.json', content: JSON.stringify({ scripts: { lint: 'tsc --noEmit', test: 'vitest run', 'test:e2e': 'playwright test', build: 'vite build' } }) },
      { path: 'README.md', content: '# Quote Pilot' },
      { path: '.gitignore', content: 'node_modules/\n' },
      { path: '.env.example', content: 'AI_API_KEY=\n' },
      { path: 'src/quote.test.ts', content: 'test("quote", () => {})' },
      { path: 'e2e/quote.spec.ts', content: 'test("quote flow", async () => {})' },
    ],
  };
}

describe('factory app contract', () => {
  it('injects the immutable quality gate and factory metadata', () => {
    const files = prepareGeneratedFiles(blueprint());
    expect(files.find((file) => file.path === 'factory.json')?.content).toContain('"active": true');
    expect(files.find((file) => file.path === '.github/workflows/factory-quality.yml')?.content).toContain('npm run test:e2e');
    expect(files.find((file) => file.path === '.gitignore')?.content).toContain('.env*');
    expect(() => assertFactoryContract(files)).not.toThrow();
  });

  it('rejects apps without real browser coverage', () => {
    const files = prepareGeneratedFiles(blueprint()).filter((file) => file.path !== 'e2e/quote.spec.ts');
    expect(() => assertFactoryContract(files)).toThrow(/Playwright browser tests/i);
  });

  it('rejects attempts to bypass tests in package scripts', () => {
    const candidate = blueprint();
    candidate.files[0] = { path: 'package.json', content: JSON.stringify({ scripts: { lint: 'tsc --noEmit', test: 'vitest run --passWithNoTests', 'test:e2e': 'playwright test', build: 'vite build' } }) };
    expect(() => prepareGeneratedFiles(candidate)).toThrow(/bypass tests/i);
  });
});
