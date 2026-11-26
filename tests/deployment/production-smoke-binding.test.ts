import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const workflow = readFileSync('.github/workflows/production-smoke.yml', 'utf8');

describe('production smoke deployment binding', () => {
  it('tests an immutable deployment and rejects a production deployment race', () => {
    expect(workflow).toContain('ref: ${{ steps.target.outputs.sha }}');
    expect(workflow).toContain('RHYTHM_DEPLOYMENT_URL: ${{ steps.target.outputs.url }}');
    expect(workflow).toContain('deployments?environment=Production&per_page=1');
    expect(workflow).toContain('[[ "$current_id" == "$DEPLOYMENT_ID" ]]');
    expect(workflow).toContain('name: Verify production deployment did not change during smoke');
    expect(workflow).toContain('[[ "$actual_id" == "$EXPECTED_DEPLOYMENT_ID" ]]');
    expect(workflow).toContain('[[ "$actual_sha" == "$EXPECTED_SHA" ]]');
    expect(workflow).toContain('[[ "$actual_url" == "$EXPECTED_URL" ]]');
    expect(workflow).toContain('$GITHUB_SERVER_URL/$GITHUB_REPOSITORY');
  });
});
