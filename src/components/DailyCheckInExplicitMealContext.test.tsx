import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('./DailyCheckInModal.tsx', import.meta.url), 'utf8');

describe('DailyCheckInModal explicit meal context', () => {
  it('persists hunger and fullness only after explicit interaction', () => {
    expect(source).toContain('...(hungerTouched?{hungerBefore}:{})');
    expect(source).toContain('...(fullnessTouched?{fullnessAfter}:{})');
    expect(source).toContain('setHungerTouched');
    expect(source).toContain('setFullnessTouched');
  });

  it('resets meal-context touched state for every fresh check-in', () => {
    expect(source).toContain('setHungerTouched(false)');
    expect(source).toContain('setFullnessTouched(false)');
  });

  it('does not fabricate unasked pace or distraction observations', () => {
    expect(source).not.toContain("eatingPace:'moderate'");
    expect(source).not.toContain("distraction:'mindful'");
  });
});
