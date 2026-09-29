import type { DailyCheckIn, FoodMoment } from '../types';

export const PERSONAL_EXPORT_SCHEMA_VERSION = 1 as const;

const isDemoMoment = (moment: FoodMoment) => /^moment-\d{1,2}$/.test(moment.id);
const isDemoCheckIn = (checkIn: DailyCheckIn) => /^checkin-\d{1,2}$/.test(checkIn.id);

export interface PersonalDataExport {
  schemaVersion: typeof PERSONAL_EXPORT_SCHEMA_VERSION;
  exportedAt: string;
  moments: FoodMoment[];
  checkIns: DailyCheckIn[];
}

export function buildPersonalDataExport(
  moments: FoodMoment[],
  checkIns: DailyCheckIn[],
  exportedAt = new Date(),
): PersonalDataExport {
  return {
    schemaVersion: PERSONAL_EXPORT_SCHEMA_VERSION,
    exportedAt: exportedAt.toISOString(),
    moments: moments.filter((moment) => !isDemoMoment(moment)),
    checkIns: checkIns.filter((checkIn) => !isDemoCheckIn(checkIn)),
  };
}

export function serializePersonalDataExport(data: PersonalDataExport): string {
  return JSON.stringify(data, null, 2);
}
