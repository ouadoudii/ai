import { describe, expect, it } from 'vitest';
import { buildDiscoveryCoachDraft } from './discoveryCoachDraft';

describe('buildDiscoveryCoachDraft', () => {
  it.each([
    ['de', 'Hilf mir, diesen persönlichen Zusammenhang zu verstehen:'],
    ['en', 'Help me understand this personal pattern:'],
    ['fr', 'Aide-moi à comprendre ce lien personnel :'],
    ['ar', 'ساعدني على فهم هذا النمط الشخصي:'],
  ] as const)('keeps the displayed observation verbatim in %s', (language, prefix) => {
    const observation = 'بيض مسلوق + café au lait';
    const draft = buildDiscoveryCoachDraft(observation, language);
    expect(draft).toBe(`${prefix} ${observation}`);
  });

  it('does not create a draft for an empty observation', () => {
    expect(buildDiscoveryCoachDraft('   ', 'de')).toBe('');
  });

  it('only trims surrounding whitespace and never rewrites user-authored text', () => {
    expect(buildDiscoveryCoachDraft('  Harira   mit Brot  ', 'de')).toContain('Harira   mit Brot');
  });
});
