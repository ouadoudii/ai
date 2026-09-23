import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('./DailyCheckInModal.tsx', import.meta.url), 'utf8');

describe('DailyCheckInModal explicit wellbeing', () => {
  it('persists energy and mood only after explicit interaction', () => {
    expect(source).toContain('...(energyTouched?{energyLevel}:{})');
    expect(source).toContain('...(moodTouched?{mood}:{})');
    expect(source).toContain('setEnergyTouched(true)');
    expect(source).toContain('setMoodTouched(true)');
  });

  it('resets touched state whenever a fresh check-in opens', () => {
    expect(source).toContain('setEnergyTouched(false)');
    expect(source).toContain('setMoodTouched(false)');
  });

  it('does not persist invented stress or water observations', () => {
    expect(source).not.toContain('stressLevel:2');
    expect(source).not.toContain('waterGlasses:0');
  });

  it('does not visually preselect a mood before the user answers', () => {
    expect(source).toContain("moodTouched&&mood===v?'bg-amber-50 border-amber-400':'bg-white'");
  });
});
