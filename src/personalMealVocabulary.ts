export type PersonalMealVocabularyEntry = {
  source: string;
  preferred: string;
  updatedAt: string;
};

export type MealVocabularyStorage = Pick<Storage, 'getItem' | 'setItem'>;

export const PERSONAL_MEAL_VOCABULARY_LIMIT = 50;
export const PERSONAL_MEAL_VOCABULARY_STORAGE_KEY = 'moment.personalMealVocabulary.v1';

export function normalizeMealVocabularyKey(value: string): string {
  return value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

export function rememberMealCorrection(
  entries: PersonalMealVocabularyEntry[],
  source: string,
  preferred: string,
  updatedAt = new Date().toISOString(),
): PersonalMealVocabularyEntry[] {
  const cleanSource = source.trim().replace(/\s+/g, ' ');
  const cleanPreferred = preferred.trim().replace(/\s+/g, ' ');
  const sourceKey = normalizeMealVocabularyKey(cleanSource);
  const preferredKey = normalizeMealVocabularyKey(cleanPreferred);

  if (!sourceKey || !preferredKey || sourceKey === preferredKey) return entries;

  const next: PersonalMealVocabularyEntry = {
    source: cleanSource,
    preferred: cleanPreferred,
    updatedAt,
  };

  return [
    next,
    ...entries.filter((entry) => normalizeMealVocabularyKey(entry.source) !== sourceKey),
  ].slice(0, PERSONAL_MEAL_VOCABULARY_LIMIT);
}

export function findRememberedMealCorrection(
  entries: PersonalMealVocabularyEntry[],
  source: string,
): PersonalMealVocabularyEntry | undefined {
  const sourceKey = normalizeMealVocabularyKey(source);
  if (!sourceKey) return undefined;
  return entries.find((entry) => normalizeMealVocabularyKey(entry.source) === sourceKey);
}

function isVocabularyEntry(value: unknown): value is PersonalMealVocabularyEntry {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<PersonalMealVocabularyEntry>;
  return typeof candidate.source === 'string'
    && typeof candidate.preferred === 'string'
    && typeof candidate.updatedAt === 'string'
    && Boolean(normalizeMealVocabularyKey(candidate.source))
    && Boolean(normalizeMealVocabularyKey(candidate.preferred));
}

export function loadPersonalMealVocabulary(storage: MealVocabularyStorage): PersonalMealVocabularyEntry[] {
  try {
    const raw = storage.getItem(PERSONAL_MEAL_VOCABULARY_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isVocabularyEntry).slice(0, PERSONAL_MEAL_VOCABULARY_LIMIT);
  } catch {
    return [];
  }
}

export function savePersonalMealVocabulary(
  storage: MealVocabularyStorage,
  entries: PersonalMealVocabularyEntry[],
): boolean {
  try {
    storage.setItem(
      PERSONAL_MEAL_VOCABULARY_STORAGE_KEY,
      JSON.stringify(entries.filter(isVocabularyEntry).slice(0, PERSONAL_MEAL_VOCABULARY_LIMIT)),
    );
    return true;
  } catch {
    return false;
  }
}
