import { describe, expect, it } from 'vitest';
import { localizePatternInsight } from './patternInsightLocalization';
import type { CaryPatternInsight } from './patternInsights';

const lateLunch: CaryPatternInsight = { id:'late-lunch-snacking', title:'Late lunch ↔ evening snacking', observation:'On 2 of 3 days with lunch at or after 2 PM, you also logged an evening snack. This is a repeated association in your entries, not proof that late lunch caused the snack.', experiment:'On a comparable day, try lunch a little earlier and simply notice whether evening hunger feels different.', confidence:'Signal', evidenceCount:3 };

describe('localizePatternInsight', () => {
  it('keeps concrete X/Y evidence in German, French and Arabic', () => {
    expect(localizePatternInsight(lateLunch, 'de').observation).toContain('2 von 3');
    expect(localizePatternInsight(lateLunch, 'fr').observation).toContain('2 jours sur 3');
    expect(localizePatternInsight(lateLunch, 'ar').observation).toContain('2 من 3');
  });

  it('keeps pattern-specific experiments instead of generic advice', () => {
    expect(localizePatternInsight(lateLunch, 'de').experiment).toContain('früheres Mittagessen');
    expect(localizePatternInsight(lateLunch, 'fr').experiment).toContain('déjeuner un peu plus tôt');
    expect(localizePatternInsight(lateLunch, 'ar').experiment).toContain('الغداء أبكر');
  });

  it('preserves the engine copy in English', () => {
    expect(localizePatternInsight(lateLunch, 'en')).toEqual({ observation: lateLunch.observation, experiment: lateLunch.experiment });
  });
});
