import { describe, expect, it } from 'vitest';
import { getMomentDetailCopy } from './MomentDetailModal';

describe('MomentDetailModal localization', () => {
  it('localizes German chrome, semantic values, and destructive confirmation', () => {
    const copy=getMomentDetailCopy('de');
    expect(copy.categories.dinner).toBe('Abendessen');
    expect(copy.location).toBe('Ort');
    expect(copy.body).toBe('Körpersignale');
    expect(copy.energyValues.energized).toBe('Energiegeladen');
    expect(copy.delete).toBe('Löschen');
    expect(copy.deleteConfirm('Harira')).toContain('Harira');
    expect(copy.deleteConfirm('Harira')).toContain('nicht rückgängig');
  });

  it('localizes French chrome, semantic values, and destructive confirmation', () => {
    const copy=getMomentDetailCopy('fr');
    expect(copy.categories.dinner).toBe('Dîner');
    expect(copy.location).toBe('Lieu');
    expect(copy.body).toBe('Signaux du corps');
    expect(copy.energyValues.energized).toBe('Énergique');
    expect(copy.delete).toBe('Supprimer');
    expect(copy.deleteConfirm('Couscous')).toContain('Couscous');
    expect(copy.deleteConfirm('Couscous')).toContain('irréversible');
  });

  it('localizes Arabic destructive confirmation and preserves the meal title', () => {
    const copy=getMomentDetailCopy('ar');
    expect(copy.deleteConfirm('حريرة')).toContain('حريرة');
    expect(copy.deleteConfirm('حريرة')).toContain('لا يمكن التراجع');
  });

  it('keeps English fallback for an unknown locale', () => {
    const copy=getMomentDetailCopy('xx');
    expect(copy.categories.dinner).toBe('Dinner');
    expect(copy.share).toBe('Share');
    expect(copy.deleteConfirm('Soup')).toContain('cannot be undone');
  });
});
