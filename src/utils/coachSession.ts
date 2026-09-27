import { CoachChatMessage } from '../types';

export const COACH_SESSION_STORAGE_KEY = 'moment.coach.session.v1';
const MAX_SESSION_MESSAGES = 40;

const isCoachMessage = (value: unknown): value is CoachChatMessage => {
  if (!value || typeof value !== 'object') return false;
  const message = value as Partial<CoachChatMessage>;
  return (
    typeof message.id === 'string' &&
    (message.sender === 'user' || message.sender === 'coach') &&
    typeof message.text === 'string' &&
    typeof message.timestamp === 'string'
  );
};

export const readCoachSession = (storage: Pick<Storage, 'getItem'> = localStorage): CoachChatMessage[] => {
  try {
    const raw = storage.getItem(COACH_SESSION_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCoachMessage).slice(-MAX_SESSION_MESSAGES);
  } catch {
    return [];
  }
};

export const restoreCoachSessionOrDefault = (
  defaultMessages: CoachChatMessage[],
  storage: Pick<Storage, 'getItem'> = localStorage,
): CoachChatMessage[] => {
  const restored = readCoachSession(storage);
  return restored.length > 0 ? restored : defaultMessages;
};

export const writeCoachSession = (
  messages: CoachChatMessage[],
  storage: Pick<Storage, 'setItem'> = localStorage,
): void => {
  try {
    storage.setItem(COACH_SESSION_STORAGE_KEY, JSON.stringify(messages.slice(-MAX_SESSION_MESSAGES)));
  } catch {
    // Chat continuity is best-effort: storage quota/privacy mode must never break Cary.
  }
};
