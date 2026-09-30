export type PersonalMealVocabularyEntry = {
  source: string;
  preferred: string;
  updatedAt: string;
};

export const PERSONAL_MEAL_VOCABULARY_LIMIT = 50;

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
