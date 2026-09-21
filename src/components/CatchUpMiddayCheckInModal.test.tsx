import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('./CatchUpMiddayCheckInModal.tsx', import.meta.url), 'utf8');

describe('CatchUpMiddayCheckInModal explicit data', () => {
  it('does not serialize legacy invented wellbeing or eating-context defaults', () => {
    expect(source).not.toContain('mood:');
    expect(source).not.toContain('stressLevel:');
    expect(source).not.toContain('waterGlasses:');
    expect(source).not.toContain('eatingPace:');
    expect(source).not.toContain('distraction:');
  });

  it('only serializes sliders after explicit interaction', () => {
    expect(source).toContain('...(hungerTouched?{hungerBefore}:{})');
    expect(source).toContain('...(fullnessTouched?{fullnessAfter}:{})');
    expect(source).toContain('...(energyTouched?{energyLevel}:{})');
    expect(source).toContain("hungerTouched?`${hungerBefore}/5`:'—'");
    expect(source).toContain("energyTouched?`${energyLevel}/5`:'—'");
  });

  it('contains localized German and French catch-up chrome and explicit Arabic RTL', () => {
    expect(source).toContain('Möchtest du ergänzen, was du gegessen hast?');
    expect(source).toContain('Tu veux ajouter ce que tu as mangé ?');
    expect(source).toContain("dir={language==='ar'?'rtl':'ltr'}");
  });
});
