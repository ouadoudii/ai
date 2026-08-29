import { describe, expect, it } from 'vitest';
import { buildCaryDataExport } from './dataExport';

describe('Cary data export', () => {
  it('creates a stable portable envelope without mutating source arrays', () => {
    const moments: any[] = [{ id: 'm1', title: 'Frühstück' }];
    const checkIns: any[] = [{ id: 'c1', timeOfDay: 'morning' }];
    const exportedAt = '2026-08-29T00:00:00.000Z';

    const result = buildCaryDataExport(moments, checkIns, exportedAt);

    expect(result).toEqual({
      format: 'cary-data-export',
      version: 1,
      exportedAt,
      moments,
      checkIns,
    });
    expect(result.moments).toBe(moments);
    expect(result.checkIns).toBe(checkIns);
  });
});
