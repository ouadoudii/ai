import { describe, expect, it } from 'vitest';
import { parseNameStatus, validateChanges } from '../../scripts/verify-regression-coverage.mjs';

describe('regression coverage guard', () => {
  it('blocks product logic changes without regression tests', () => {
    const result = validateChanges(parseNameStatus('M\tsrc/utils/todayPriorities.ts'));
    expect(result.ok).toBe(false);
    expect(result.errors.join('\n')).toContain('without a regression test change');
  });

  it('allows product logic changes when a regression test changes too', () => {
    const result = validateChanges(parseNameStatus(['M\tsrc/utils/todayPriorities.ts','M\tsrc/todayPriorities.test.ts'].join('\n')));
    expect(result.ok).toBe(true);
  });

  it('requires E2E coverage for user-visible component changes', () => {
    const result = validateChanges(parseNameStatus(['M\tsrc/components/TodayHomeView.tsx','M\tsrc/components/TodaySnapshot.test.tsx'].join('\n')));
    expect(result.ok).toBe(false);
    expect(result.errors.join('\n')).toContain('without an E2E change');
  });

  it('allows UI changes only when regression and E2E coverage move with them', () => {
    const result = validateChanges(parseNameStatus(['M\tsrc/components/TodayHomeView.tsx','M\tsrc/components/TodaySnapshot.test.tsx','M\te2e/today-priorities.visual.spec.ts'].join('\n')));
    expect(result.ok).toBe(true);
  });

  it('does not require product coverage for docs or workflow-only changes', () => {
    const result = validateChanges(parseNameStatus(['M\tREADME.md','M\t.github/workflows/build-check.yml'].join('\n')));
    expect(result.ok).toBe(true);
  });

  it('blocks deleting tests instead of fixing them', () => {
    const result = validateChanges(parseNameStatus(['M\tsrc/App.tsx','D\tsrc/App.smoke.test.tsx','M\te2e/today-priorities.visual.spec.ts'].join('\n')));
    expect(result.ok).toBe(false);
    expect(result.errors.join('\n')).toContain('may not be deleted');
  });
});
