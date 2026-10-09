import { describe, expect, it } from 'vitest';
import { buildJournalBackup, serializeJournalBackup } from './utils/journalBackup';
import type { DailyCheckIn, FoodMoment } from './types';

const moment = (id: string, title: string, tags: string[] = []): FoodMoment => ({
  id, title, label: title, category: 'breakfast', date: '2026-10-02', time: '08:00',
  location: '', imageUrl: '', rating: 0, mood: 'neutral', tags, createdAt: 1,
} as unknown as FoodMoment);

const checkIn = (id: string): DailyCheckIn => ({
  id, date: '2026-10-02', time: '08:00', timeOfDay: 'morning', createdAt: 1,
  wellbeing: {},
} as DailyCheckIn);

describe('journal backup', () => {
  it('exports a deterministic versioned snapshot and excludes seeded/demo records', () => {
    const backup = buildJournalBackup(
      [moment('real-1', 'بيض مسلوق avec pain'), moment('demo-1', 'Demo'), moment('real-demo-tag', 'Sample', ['seed'])],
      [checkIn('user-checkin-9'), checkIn('checkin-1')],
      '2026-10-02T16:00:00.000Z',
    );
    expect(backup.schemaVersion).toBe(1);
    expect(backup.exportedAt).toBe('2026-10-02T16:00:00.000Z');
    expect(backup.moments.map(item => item.id)).toEqual(['real-1']);
    expect(backup.checkIns.map(item => item.id)).toEqual(['user-checkin-9']);
  });

  it('preserves multilingual user-authored text through JSON serialization', () => {
    const title = 'بيض مسلوق — Frühstück avec thé';
    const json = serializeJournalBackup(buildJournalBackup([moment('real-2', title)], [], '2026-10-02T16:00:00.000Z'));
    expect(json).toContain(title);
    expect(JSON.parse(json).moments[0].title).toBe(title);
  });

  it('does not mutate source arrays', () => {
    const moments = [moment('real-3', 'Couscous')];
    const checkIns = [checkIn('user-checkin-3')];
    buildJournalBackup(moments, checkIns, '2026-10-02T16:00:00.000Z');
    expect(moments).toHaveLength(1);
    expect(checkIns).toHaveLength(1);
  });
});
