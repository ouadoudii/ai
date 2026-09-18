import { describe, expect, it } from 'vitest';
import { buildEarlyOrientationCopy, getAnimalTypeNames } from './utils/earlyOrientation';

describe('early personal orientation localization', () => {
  it.each([
    ['de', 'Vorläufige Orientierung', 'Löwe', 'Niedrige Sicherheit'],
    ['en', 'Preliminary orientation', 'Lion', 'Low confidence'],
    ['fr', 'Orientation provisoire', 'Lion', 'Faible certitude'],
    ['ar', 'توجّه أولي', 'الأسد', 'ثقة منخفضة'],
  ] as const)('shows a clearly preliminary localized result in %s after few entries', (language, label, animal, confidence) => {
    const copy = buildEarlyOrientationCopy(language, 'protein_performer', 2);
    expect(copy.label).toBe(label);
    expect(copy.title).toContain(animal);
    expect(copy.description).toContain('2');
    expect(copy.progress).toContain('2/12');
    expect(copy.confidence).toBe(confidence);
    expect(copy.dataBasis).toContain('2');
  });

  it('raises confidence only as the evidence base grows', () => {
    expect(buildEarlyOrientationCopy('de', 'circadian_rhythm', 1).confidence).toBe('Niedrige Sicherheit');
    expect(buildEarlyOrientationCopy('de', 'circadian_rhythm', 5).confidence).toBe('Mittlere Sicherheit');
    expect(buildEarlyOrientationCopy('de', 'circadian_rhythm', 9).confidence).toBe('Höhere Sicherheit');
  });

  it('does not claim a personal pattern or confidence without real data', () => {
    const copy = buildEarlyOrientationCopy('fr', 'intuitive_mindful', 0);
    expect(copy.label).toBe('Pas encore d’estimation');
    expect(copy.title).not.toContain('Renard');
    expect(copy.confidence).toBe('Pas encore de certitude');
    expect(copy.dataBasis).toBe('Pas encore de vraie entrée');
  });

  it('provides all four animal profiles in every supported language', () => {
    for (const language of ['de', 'en', 'fr', 'ar'] as const) {
      expect(getAnimalTypeNames(language)).toHaveLength(4);
    }
  });
});
