import { DailyCheckIn, FoodMoment } from '../types';

export interface CaryDataExport {
  format: 'cary-data-export';
  version: 1;
  exportedAt: string;
  moments: FoodMoment[];
  checkIns: DailyCheckIn[];
}

export function buildCaryDataExport(
  moments: FoodMoment[],
  checkIns: DailyCheckIn[],
  exportedAt = new Date().toISOString(),
): CaryDataExport {
  return {
    format: 'cary-data-export',
    version: 1,
    exportedAt,
    moments,
    checkIns,
  };
}

export function downloadCaryDataExport(moments: FoodMoment[], checkIns: DailyCheckIn[]) {
  const payload = buildCaryDataExport(moments, checkIns);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const date = payload.exportedAt.slice(0, 10);

  anchor.href = url;
  anchor.download = `cary-daten-${date}.json`;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
