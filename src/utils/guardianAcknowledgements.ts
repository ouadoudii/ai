const STORAGE_KEY = 'moment.guardian.acknowledged-occurrences.v1';
const MAX_ACKNOWLEDGEMENTS = 100;

export const readGuardianAcknowledgements = (storage: Pick<Storage, 'getItem'>): string[] => {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === 'string').slice(-MAX_ACKNOWLEDGEMENTS);
  } catch {
    return [];
  }
};

export const acknowledgeGuardianOccurrence = (
  current: string[],
  alarmId: string,
): string[] => {
  const id = alarmId.trim();
  if (!id) return current;
  return [...current.filter((value) => value !== id), id].slice(-MAX_ACKNOWLEDGEMENTS);
};

export const writeGuardianAcknowledgements = (
  storage: Pick<Storage, 'setItem'>,
  acknowledgements: string[],
): void => {
  storage.setItem(STORAGE_KEY, JSON.stringify(acknowledgements.slice(-MAX_ACKNOWLEDGEMENTS)));
};
