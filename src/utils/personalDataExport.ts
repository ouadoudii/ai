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

export function buildPersonalDataExport(moments: FoodMoment[], checkIns: DailyCheckIn[], exportedAt = new Date()): PersonalDataExport {
  return { schemaVersion: PERSONAL_EXPORT_SCHEMA_VERSION, exportedAt: exportedAt.toISOString(), moments: moments.filter((moment) => !isDemoMoment(moment)), checkIns: checkIns.filter((checkIn) => !isDemoCheckIn(checkIn)) };
}

export function serializePersonalDataExport(data: PersonalDataExport): string { return JSON.stringify(data, null, 2); }

export function downloadPersonalDataExport(moments: FoodMoment[], checkIns: DailyCheckIn[], exportedAt = new Date()): string {
  const payload = buildPersonalDataExport(moments, checkIns, exportedAt);
  const blob = new Blob([serializePersonalDataExport(payload)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const filename = `moment-data-${payload.exportedAt.slice(0, 10)}.json`;
  anchor.href = url; anchor.download = filename; anchor.style.display = 'none'; document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
  return filename;
}
