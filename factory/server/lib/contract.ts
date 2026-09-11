import type { AppBlueprint, GeneratedFile } from './openai';

const QUALITY_WORKFLOW_PATH = '.github/workflows/factory-quality.yml';

const QUALITY_WORKFLOW = `name: Factory Quality Gate

on:
  push:
  pull_request:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Install dependencies
        run: npm install
      - name: Type and lint checks
        run: npm run lint
      - name: Unit and integration tests
        run: npm test
      - name: Production dependency audit
        run: npm audit --omit=dev --audit-level=high
      - name: Install Playwright Chromium
        run: npx playwright install --with-deps chromium
      - name: Real-browser critical journeys
        run: npm run test:e2e
      - name: Production build
        run: npm run build
      - name: Upload browser traces
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: browser-quality-report
          path: |
            test-results/
            playwright-report/
          if-no-files-found: ignore
          retention-days: 14
`;

function normalizePath(path: string) {
  return path.replace(/^\/+/, '').replace(/\\/g, '/');
}

function requireFile(files: Map<string, GeneratedFile>, path: string) {
  const file = files.get(path);
  if (!file) throw new Error(`Generated app is missing required file: ${path}`);
  return file;
}

export function prepareGeneratedFiles(blueprint: AppBlueprint): GeneratedFile[] {
  const files = new Map<string, GeneratedFile>();
  for (const file of blueprint.files) {
    const path = normalizePath(file.path);
    files.set(path, { path, content: file.content });
  }

  const gitignore = files.get('.gitignore')?.content ?? '';
  const additions: string[] = [];
  if (!/(^|\n)\.env\*(\r?\n|$)/.test(gitignore)) additions.push('.env*');
  if (!/(^|\n)!\.env\.example(\r?\n|$)/.test(gitignore)) additions.push('!.env.example');
  files.set('.gitignore', {
    path: '.gitignore',
    content: `${gitignore.trimEnd()}${gitignore.trim() ? '\n' : ''}${additions.join('\n')}${additions.length ? '\n' : ''}`,
  });

  files.set('factory.json', {
    path: 'factory.json',
    content: `${JSON.stringify({
      factoryVersion: 1,
      active: true,
      appName: blueprint.appName,
      repoName: blueprint.repoName,
      summary: blueprint.summary,
      lastImprovedAt: null,
    }, null, 2)}\n`,
  });
  files.set(QUALITY_WORKFLOW_PATH, { path: QUALITY_WORKFLOW_PATH, content: QUALITY_WORKFLOW });

  const result = [...files.values()];
  assertFactoryContract(result);
  return result;
}

export function assertFactoryContract(input: GeneratedFile[]) {
  const files = new Map(input.map((file) => [normalizePath(file.path), file]));
  for (const required of ['package.json', 'README.md', '.gitignore', '.env.example', 'factory.json']) {
    requireFile(files, required);
  }

  const packageJson = JSON.parse(requireFile(files, 'package.json').content) as { scripts?: Record<string, string> };
  for (const script of ['lint', 'test', 'test:e2e', 'build']) {
    if (!packageJson.scripts?.[script]?.trim()) throw new Error(`package.json is missing required script: ${script}`);
  }
  const scripts = Object.values(packageJson.scripts ?? {}).join('\n');
  if (/--passWithNoTests|\b(?:test|it|describe)\.skip\b/i.test(scripts)) {
    throw new Error('Generated package scripts may not bypass tests.');
  }

  const factory = JSON.parse(requireFile(files, 'factory.json').content) as { active?: boolean; lastImprovedAt?: unknown };
  if (factory.active !== true || factory.lastImprovedAt !== null) throw new Error('factory.json is not active or has an invalid initial state.');

  const gitignore = requireFile(files, '.gitignore').content;
  if (!gitignore.includes('.env*') || !gitignore.includes('!.env.example')) {
    throw new Error('.gitignore must protect environment files while allowing .env.example.');
  }

  const hasUnitTest = [...files.keys()].some((path) => !path.startsWith('e2e/') && /\.(test|spec)\.[cm]?[jt]sx?$/.test(path));
  const hasBrowserTest = [...files.keys()].some((path) => path.startsWith('e2e/') && /\.spec\.[cm]?[jt]s$/.test(path));
  if (!hasUnitTest) throw new Error('Generated app must include meaningful unit or integration tests.');
  if (!hasBrowserTest) throw new Error('Generated app must include Playwright browser tests in e2e/.');

  const workflow = requireFile(files, QUALITY_WORKFLOW_PATH).content;
  for (const command of ['npm run lint', 'npm test', 'npm audit --omit=dev --audit-level=high', 'npm run test:e2e', 'npm run build']) {
    if (!workflow.includes(command)) throw new Error(`Quality workflow is missing: ${command}`);
  }
}
