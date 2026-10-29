import { describe, expect, it } from 'vitest';
import config from '../playwright.config';

describe('Playwright release gate', () => {
  it('fails rather than accepting a Desktop or Android journey that passes only on retry', () => {
    // Keep retries for diagnostic traces; a flaky test must still make CI red.
    expect(config.retries).toBeGreaterThan(0);
    expect(config.failOnFlakyTests).toBe(true);
    expect(config.projects?.map((project) => project.name)).toEqual([
      'desktop-arabic',
      'android-arabic',
    ]);
  });
});
