import { describe, expect, it } from 'vitest';
import {
  getDailyHeartNote,
  getOrCreateHeartNoteSeed,
  HEART_NOTES,
  HEART_NOTE_OFFLINE_SEED,
  HEART_NOTE_SEED_KEY,
  selectDailyHeartNote,
} from './dailyHeartNote';

describe('daily Arabic heart note', () => {
  it('keeps one note per installation per local calendar day', () => {
    const today = selectDailyHeartNote('alpha-user', '2026-10-27');
    expect(today).toBe(selectDailyHeartNote('alpha-user', '2026-10-27'));
    expect(today).not.toBe(selectDailyHeartNote('alpha-user', '2026-10-28'));
  });

  it('personalizes between installations without reading private journal data', () => {
    expect(selectDailyHeartNote('alpha-user', '2026-10-27'))
      .not.toBe(selectDailyHeartNote('beta-user', '2026-10-27'));
  });

  it('cycles through all 31 notes without repeating for 31 consecutive days', () => {
    const start = Date.UTC(2026, 9, 1);
    const notes = Array.from({ length: 31 }, (_, offset) => {
      const date = new Date(start + offset * 86_400_000).toISOString().slice(0, 10);
      return selectDailyHeartNote('returning-user', date);
    });
    expect(HEART_NOTES).toHaveLength(31);
    expect(new Set(notes).size).toBe(31);
  });

  it('uses the selected local timezone rather than UTC for day rollover', () => {
    const instant = new Date('2026-10-27T23:30:00Z');
    expect(getDailyHeartNote('alpha-user', instant, 'Asia/Riyadh'))
      .toBe(selectDailyHeartNote('alpha-user', '2026-10-28'));
    expect(getDailyHeartNote('alpha-user', instant, 'UTC'))
      .toBe(selectDailyHeartNote('alpha-user', '2026-10-27'));
  });

  it('persists a device-local seed and reuses it without overwriting', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
    };
    const first = getOrCreateHeartNoteSeed(storage);
    expect(first.length).toBeGreaterThan(7);
    expect(values.get(HEART_NOTE_SEED_KEY)).toBe(first);
    expect(getOrCreateHeartNoteSeed(storage)).toBe(first);
  });

  it('shows a safe offline fallback when browser storage is blocked', () => {
    const blocked = {
      getItem: () => { throw new Error('Storage disabled'); },
      setItem: () => { throw new Error('Storage disabled'); },
    };
    expect(getOrCreateHeartNoteSeed(blocked)).toBe(HEART_NOTE_OFFLINE_SEED);
    expect(selectDailyHeartNote(HEART_NOTE_OFFLINE_SEED, '2026-10-27')).toBeTruthy();
  });

  it('keeps all visible notes Arabic, gentle and non-punitive', () => {
    for (const note of HEART_NOTES) {
      expect(note).toMatch(/[\u0600-\u06FF]/);
      expect(note).not.toMatch(/(?:عقاب|ذنب|فشل|سعرات|وزن|ممنوع|سيئ)/);
    }
  });
});
