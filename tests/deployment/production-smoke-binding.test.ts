import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const workflow = readFileSync('.github/workflows/production-smoke.yml', 'utf8');

describe('production smoke deployment binding', () => {
  it('binds the public production smoke to the exact deployment and rejects a race', () => {
    expect(workflow).toContain('ref: ${{ steps.target.outputs.sha }}');
    expect(workflow).toContain('RHYTHM_EXPECTED_SHA: ${{ steps.target.outputs.sha }}');
    expect(workflow).toContain('deployments?environment=Production&per_page=1');
    expect(workflow).toContain('[[ "$current_id" == "$DEPLOYMENT_ID" ]]');
    expect(workflow).toContain('name: Verify production deployment did not change during smoke');
    expect(workflow).toContain('[[ "$actual_id" == "$EXPECTED_DEPLOYMENT_ID" ]]');
    expect(workflow).toContain('[[ "$actual_sha" == "$EXPECTED_SHA" ]]');
    expect(workflow).toContain('[[ "$actual_url" == "$EXPECTED_URL" ]]');
    expect(workflow).toContain('$GITHUB_SERVER_URL/$GITHUB_REPOSITORY');
    const smoke = readFileSync('e2e/production-smoke.spec.ts', 'utf8');
    expect(smoke.match(/await assertBuild\(\)/g)).toHaveLength(2);
    expect(smoke).toContain('rhythm-build-sha');
    expect(readFileSync('vite.config.ts', 'utf8')).toContain('VERCEL_GIT_COMMIT_SHA');
  });
});
