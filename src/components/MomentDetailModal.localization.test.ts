import { describe, expect, it } from 'vitest';
import { getMomentDetailCopy } from './MomentDetailModal';

describe('MomentDetailModal localization', () => {
  it('localizes German chrome and semantic values', () => {
    const copy=getMomentDetailCopy('de');
    expect(copy.categories.dinner).toBe('Abendessen');
    expect(copy.location).toBe('Ort');
    expect(copy.body).toBe('Körpersignale');
    expect(copy.energyValues.energized).toBe('Energiegeladen');
    expect(copy.delete).toBe('Löschen');
  });

  it('localizes French chrome and semantic values', () => {
    const copy=getMomentDetailCopy('fr');
    expect(copy.categories.dinner).toBe('Dîner');
    expect(copy.location).toBe('Lieu');
    expect(copy.body).toBe('Signaux du corps');
    expect(copy.energyValues.energized).toBe('Énergique');
    expect(copy.delete).toBe('Supprimer');
  });

  it('keeps English fallback for an unknown locale', () => {
    const copy=getMomentDetailCopy('xx');
    expect(copy.categories.dinner).toBe('Dinner');
    expect(copy.share).toBe('Share');
  });
});
