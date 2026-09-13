import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'));

describe('Vercel Git deployment policy', () => {
  it('deploys main automatically but skips feature-branch previews', () => {
    expect(config.git?.deploymentEnabled?.['*']).toBe(false);
    expect(config.git?.deploymentEnabled?.main).toBe(true);
  });

  it('keeps the production quality gate in the Vercel build command', () => {
    expect(config.buildCommand).toBe('npm run quality:deploy && npm run build');
  });
});
