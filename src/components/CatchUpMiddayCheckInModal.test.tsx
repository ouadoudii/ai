import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getFocusTrapDestination } from './CatchUpMiddayCheckInModal';

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
    expect(source).toContain('...(hungerTouched ? { hungerBefore } : {})');
    expect(source).toContain('...(fullnessTouched ? { fullnessAfter } : {})');
    expect(source).toContain('...(energyTouched ? { energyLevel } : {})');
    expect(source).toContain("hungerTouched ? `${hungerBefore}/5` : '—'");
    expect(source).toContain("energyTouched ? `${energyLevel}/5` : '—'");
  });

  it('cannot submit a completely untouched catch-up as personal history', () => {
    expect(source).toContain('const hasMeaningfulInput = Boolean(mealTitle.trim() || note.trim() || hungerTouched || fullnessTouched || energyTouched)');
    expect(source).toContain('if (!hasMeaningfulInput) return');
    expect(source).toContain('disabled={!hasMeaningfulInput}');
    expect(source).toContain('aria-disabled={!hasMeaningfulInput}');
  });

  it('contains localized German and French catch-up chrome and explicit Arabic RTL', () => {
    expect(source).toContain('Möchtest du ergänzen, was du gegessen hast?');
    expect(source).toContain('Tu veux ajouter ce que tu as mangé ?');
    expect(source).toContain("dir={language === 'ar' ? 'rtl' : 'ltr'}");
  });

  it('exposes an accessible named dialog and makes the app background inert', () => {
    expect(source).toContain('aria-labelledby="catchup-midday-title"');
    expect(source).toContain('aria-describedby="catchup-midday-description"');
    expect(source).toContain("appRoot?.setAttribute('inert', '')");
    expect(source).toContain("appRoot?.setAttribute('aria-hidden', 'true')");
  });
});

describe('catch-up focus trap', () => {
  it('wraps backwards from the first control and forwards from the last control', () => {
    expect(getFocusTrapDestination(true, true, true, false)).toBe('last');
    expect(getFocusTrapDestination(false, true, false, true)).toBe('first');
  });

  it('recaptures focus when it somehow starts outside and otherwise allows normal tabbing', () => {
    expect(getFocusTrapDestination(false, false, false, false)).toBe('first');
    expect(getFocusTrapDestination(true, false, false, false)).toBe('last');
    expect(getFocusTrapDestination(false, true, false, false)).toBeNull();
  });
});
