import { describe, expect, it } from 'vitest';
import { COACH_SESSION_STORAGE_KEY, readCoachSession, writeCoachSession } from './coachSession';
import { CoachChatMessage } from '../types';

const messages: CoachChatMessage[] = [
  { id: 'u1', sender: 'user', text: 'Heute war ich nach dem Mittagessen müde.', timestamp: '14:10' },
  { id: 'c1', sender: 'coach', text: 'Dann schauen wir auf Mittagessen und Schlaf zusammen.', timestamp: '14:11' },
];

describe('coach session continuity', () => {
  it('restores a valid Cary conversation after remount', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => void values.set(key, value),
    };

    writeCoachSession(messages, storage);

    expect(readCoachSession(storage)).toEqual(messages);
    expect(values.has(COACH_SESSION_STORAGE_KEY)).toBe(true);
  });

  it('ignores malformed persisted data instead of breaking the coach', () => {
    const storage = { getItem: () => '{not-json' };
    expect(readCoachSession(storage)).toEqual([]);
  });

  it('keeps the session bounded to the latest 40 messages', () => {
    const many = Array.from({ length: 45 }, (_, index): CoachChatMessage => ({
      id: `u${index}`,
      sender: 'user',
      text: `message ${index}`,
      timestamp: '12:00',
    }));
    let saved = '';
    writeCoachSession(many, { setItem: (_key, value) => { saved = value; } });
    const restored = readCoachSession({ getItem: () => saved });
    expect(restored).toHaveLength(40);
    expect(restored[0].id).toBe('u5');
  });
});
