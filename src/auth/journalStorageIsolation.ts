export const JOURNAL_STORAGE_KEYS = [
  'nimmapp_moments_v1',
  'food_journey_moments_v1',
  'nimmapp_checkins_v1',
  'getyourcoach_checkins_v1',
] as const;

/**
 * Journal records in the current app are stored in a device-global namespace.
 * Until account-scoped caches exist, never carry that namespace across an
 * authentication boundary: doing so can expose one person's journal to a
 * guest or merge it into a different account's cloud snapshot.
 */
export function clearUnscopedJournalStorage(storage: Pick<Storage, 'removeItem'> = localStorage) {
  for (const key of JOURNAL_STORAGE_KEYS) storage.removeItem(key);
}
