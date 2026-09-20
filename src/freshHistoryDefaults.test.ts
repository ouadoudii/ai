import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const appSource = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');

describe('fresh personal history defaults', () => {
  it('does not seed demo meals or check-ins into a fresh profile', () => {
    expect(appSource).not.toContain("import { INITIAL_FOOD_MOMENTS }");
    expect(appSource).not.toContain("import { INITIAL_DAILY_CHECK_INS }");
    expect(appSource).not.toMatch(/return\s+INITIAL_FOOD_MOMENTS/);
    expect(appSource).not.toMatch(/return\s+INITIAL_DAILY_CHECK_INS/);
    expect(appSource).toMatch(/Failed to load moments[\s\S]*return \[\]/);
    expect(appSource).toMatch(/Failed to load check-ins[\s\S]*return \[\]/);
  });
});
