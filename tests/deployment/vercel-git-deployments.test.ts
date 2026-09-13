import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'));

function runIgnoreCommand(ref: string) {
  return spawnSync('bash', ['-lc', config.ignoreCommand], {
    env: { ...process.env, VERCEL_GIT_COMMIT_REF: ref },
  }).status;
}

describe('Vercel Git deployment policy', () => {
  it('builds main but skips feature-branch previews before the build starts', () => {
    expect(config.git?.deploymentEnabled).toBeUndefined();
    expect(runIgnoreCommand('main')).toBe(1);
    expect(runIgnoreCommand('feature/example')).toBe(0);
    expect(runIgnoreCommand('improve/example')).toBe(0);
  });

  it('keeps the production quality gate in the Vercel build command', () => {
    expect(config.buildCommand).toBe('npm run quality:deploy && npm run build');
  });
});
