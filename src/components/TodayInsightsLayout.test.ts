import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('Today insight layout regression', () => {
  const source = readFileSync(new URL('./TodayHomeView.tsx', import.meta.url), 'utf8');
  it('keeps all four existing insights visible in the responsive layout', () => {
    expect(source).toContain('data-testid="today-insights-grid"');
    expect(source).toContain('grid-cols-1 gap-4 xl:grid-cols-2');
    for (const name of ['LoggingStreakCard', 'MealFrequencyInsightCard', 'MealDayCoverageCard', 'PinnedMealsShortcutCard']) {
      expect(source).toContain('<' + name + ' moments={realMoments}');
    }
  });
  it('keeps the latest-moment and add-moment actions outside the insight grid', () => {
    const grid = source.indexOf('data-testid="today-insights-grid"');
    const recent = source.indexOf("copy('Your recent moments'");
    expect(grid).toBeGreaterThan(0);
    expect(recent).toBeGreaterThan(grid);
    expect(source).toContain('onClick={openAdd}');
  });
});
