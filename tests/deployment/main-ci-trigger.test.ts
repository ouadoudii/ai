import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const workflow = readFileSync('.github/workflows/build-check.yml', 'utf8');

describe('post-merge main CI trigger', () => {
  it('runs the full release gate after a pull request is merged', () => {
    expect(workflow).toContain('types: [opened, synchronize, reopened, closed]');
    expect(
      workflow.match(/github\.event\.pull_request\.merged == true/g),
    ).toHaveLength(4);
    expect(workflow).toContain('name: Regression coverage guard');
    expect(workflow).toContain('name: Tests');
    expect(workflow).toContain('name: E2E');
    expect(workflow).toContain('name: Production build');
  });
});
