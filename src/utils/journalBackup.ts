import type { DailyCheckIn, FoodMoment } from '../types';

export const JOURNAL_BACKUP_SCHEMA_VERSION = 1 as const;

const isDemoId = (id: string) => /^(demo|seed|sample|checkin-[123](?:$|-))/i.test(id.trim());
const isDemoMoment = (moment: FoodMoment) =>
  isDemoId(moment.id) || moment.tags?.some(tag => /^(demo|seed|sample)$/i.test(tag.trim())) === true;

export type JournalBackup = {
  schemaVersion: typeof JOURNAL_BACKUP_SCHEMA_VERSION;
  exportedAt: string;
  moments: FoodMoment[];
  checkIns: DailyCheckIn[];
};

/** Build a local-only, portable snapshot of user-owned journal data. */
export function buildJournalBackup(
  moments: FoodMoment[],
  checkIns: DailyCheckIn[],
  exportedAt = new Date().toISOString(),
): JournalBackup {
  return {
    schemaVersion: JOURNAL_BACKUP_SCHEMA_VERSION,
    exportedAt,
    moments: moments.filter(moment => !isDemoMoment(moment)),
    checkIns: checkIns.filter(checkIn => !isDemoId(checkIn.id)),
  };
}

export function serializeJournalBackup(backup: JournalBackup): string {
  return JSON.stringify(backup, null, 2);
}
