import { describe, expect, it } from 'vitest';
import { buildCoachConversationContext, buildContextualCoachQuery } from './apiClient';
import type { CoachChatMessage } from './types';

const message = (id: string, sender: 'user' | 'coach', text: string): CoachChatMessage => ({
  id,
  sender,
  text,
  timestamp: 'Heute',
});

describe('Cary follow-up conversation context', () => {
  it('keeps the recent dialogue so a short follow-up has its referent', () => {
    const history = [
      message('1', 'user', 'Ich hatte gestern nach dem Couscous ein starkes Nachmittagstief.'),
      message('2', 'coach', 'Das könnte mit Portionsgröße, Tempo oder Schlaf zusammenhängen.'),
    ];

    const query = buildContextualCoachQuery('Und heute?', history);

    expect(query).toContain('Nutzer: Ich hatte gestern nach dem Couscous ein starkes Nachmittagstief.');
    expect(query).toContain('Cary: Das könnte mit Portionsgröße, Tempo oder Schlaf zusammenhängen.');
    expect(query).toContain('Aktuelle Frage:\nUnd heute?');
  });

  it('preserves Arabic/Darija and mixed-language turns verbatim', () => {
    const history = [
      message('1', 'user', 'فطرت بيض وخبز، danach war meine Energie gut'),
      message('2', 'coach', 'مزيان — das klingt nach einem stabilen Start.'),
    ];

    const context = buildCoachConversationContext(history);

    expect(context[0].text).toContain('فطرت بيض وخبز');
    expect(context[1].text).toContain('مزيان');
  });

  it('bounds context to eight recent messages and 600 characters per turn', () => {
    const history = Array.from({ length: 12 }, (_, index) =>
      message(String(index), index % 2 === 0 ? 'user' : 'coach', `${index}-${'x'.repeat(700)}`),
    );

    const context = buildCoachConversationContext(history);

    expect(context).toHaveLength(8);
    expect(context[0].text.startsWith('4-')).toBe(true);
    expect(context.every((turn) => turn.text.length <= 600)).toBe(true);
  });

  it('leaves a first question unchanged when no conversation exists', () => {
    expect(buildContextualCoachQuery('Wie war mein Frühstück?', [])).toBe('Wie war mein Frühstück?');
  });
});
