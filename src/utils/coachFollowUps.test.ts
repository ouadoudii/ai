import { describe, expect, it } from 'vitest';
import { buildCoachFollowUps } from './coachFollowUps';

describe('buildCoachFollowUps', () => {
  it.each(['de', 'en', 'fr', 'ar'] as const)('returns three optional follow-ups for %s', (locale) => {
    const result = buildCoachFollowUps('Why am I tired after lunch?', 'A useful observation.', locale);
    expect(result).toHaveLength(3);
    expect(result.every(Boolean)).toBe(true);
  });

  it('keeps mixed-script meal text in the contextual suggestion', () => {
    const result = buildCoachFollowUps('بيض مسلوق + pain complet nach dem Training', 'Das fällt in deinen Einträgen auf.', 'de');
    expect(result[0]).toContain('بيض مسلوق + pain complet');
  });

  it('suppresses suggestions for empty or failed answer content', () => {
    expect(buildCoachFollowUps('Warum?', '', 'de')).toEqual([]);
    expect(buildCoachFollowUps('', 'Antwort', 'de')).toEqual([]);
  });

  it('bounds long question context without losing its beginning', () => {
    const question = `Couscous ${'sehr '.repeat(30)}spät`;
    const result = buildCoachFollowUps(question, 'Antwort', 'de');
    expect(result[0]).toContain('Couscous');
    expect(result[0]).toContain('…');
    expect(result[0].length).toBeLessThan(160);
  });
});
