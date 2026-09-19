import { describe, expect, it } from 'vitest';
import { DailyCheckIn } from './types';
import { deriveProactiveInsights, markInsightShown, recordInsightFeedback } from './utils/proactiveInsights';

const checkIn = (date: string, time = '12:00', energy = 3, sleep = 7.5, meal = false): DailyCheckIn => ({
  id: `${date}-${time}`,
  date,
  time,
  timeOfDay: 'midday',
  sleep: { durationHours: sleep },
  food: meal ? { mealTitle: 'meal', category: 'dinner' } : undefined,
  wellbeing: { energyLevel: energy },
  createdAt: Date.parse(`${date}T${time}:00Z`),
});

const wellbeingOnly = (date: string, time = '23:00'): DailyCheckIn => ({
  id: `${date}-${time}-wellbeing`, date, time, timeOfDay: 'evening', sleep: {}, wellbeing: { energyLevel: 3 }, createdAt: Date.parse(`${date}T${time}:00Z`),
});

describe('personal proactive insights', () => {
  it('emits no generic reminder when personal evidence is insufficient', () => {
    expect(deriveProactiveInsights([checkIn('2026-09-01'), checkIn('2026-09-02')])).toEqual([]);
  });

  it('detects a recurring personal low-energy weekday only with repeated evidence', () => {
    const data = [
      checkIn('2026-09-07', '12:00', 2), checkIn('2026-09-14', '12:00', 2), checkIn('2026-09-21', '12:00', 2),
      checkIn('2026-09-08', '12:00', 4), checkIn('2026-09-09', '12:00', 4), checkIn('2026-09-10', '12:00', 4),
    ];
    expect(deriveProactiveInsights(data)[0]).toMatchObject({ kind: 'energy-pattern', evidenceDays: 3 });
  });

  it('does not blame late meals when short sleep matches the personal baseline', () => {
    const data = [
      checkIn('2026-08-01', '22:00', 3, 7.5, true), checkIn('2026-08-02', '08:00', 3, 6.1),
      checkIn('2026-08-05', '22:00', 3, 7.5, true), checkIn('2026-08-06', '08:00', 3, 6.0),
      checkIn('2026-08-09', '22:00', 3, 7.5, true), checkIn('2026-08-10', '08:00', 3, 6.2),
      checkIn('2026-08-13', '19:00', 3, 7.5, true), checkIn('2026-08-14', '08:00', 3, 6.1),
      checkIn('2026-08-17', '19:00', 3, 7.5, true), checkIn('2026-08-18', '08:00', 3, 6.0),
      checkIn('2026-08-21', '19:00', 3, 7.5, true), checkIn('2026-08-22', '08:00', 3, 6.2),
    ];
    expect(deriveProactiveInsights(data).find(insight => insight.kind === 'late-meal-sleep')).toBeUndefined();
  });

  it('links next-day sleep even when another same-day check-in intervenes', () => {
    const data = [
      checkIn('2026-08-01', '22:00', 3, 7.5, true), wellbeingOnly('2026-08-01'), checkIn('2026-08-02', '08:00', 3, 6.0),
      checkIn('2026-08-05', '22:00', 3, 7.5, true), wellbeingOnly('2026-08-05'), checkIn('2026-08-06', '08:00', 3, 6.2),
      checkIn('2026-08-09', '22:00', 3, 7.5, true), wellbeingOnly('2026-08-09'), checkIn('2026-08-10', '08:00', 3, 6.1),
      checkIn('2026-08-13', '19:00', 3, 7.5, true), checkIn('2026-08-14', '08:00', 3, 7.6),
      checkIn('2026-08-17', '19:00', 3, 7.5, true), checkIn('2026-08-18', '08:00', 3, 7.4),
      checkIn('2026-08-21', '19:00', 3, 7.5, true), checkIn('2026-08-22', '08:00', 3, 7.7),
    ];
    expect(deriveProactiveInsights(data)[0]).toMatchObject({ kind: 'late-meal-sleep', evidenceDays: 3 });
  });

  it('emits a late-meal insight only when sleep is meaningfully worse than comparison nights', () => {
    const data = [
      checkIn('2026-08-01', '22:00', 3, 7.5, true), checkIn('2026-08-02', '08:00', 3, 6.0),
      checkIn('2026-08-05', '22:00', 3, 7.5, true), checkIn('2026-08-06', '08:00', 3, 6.2),
      checkIn('2026-08-09', '22:00', 3, 7.5, true), checkIn('2026-08-10', '08:00', 3, 6.1),
      checkIn('2026-08-13', '19:00', 3, 7.5, true), checkIn('2026-08-14', '08:00', 3, 7.6),
      checkIn('2026-08-17', '19:00', 3, 7.5, true), checkIn('2026-08-18', '08:00', 3, 7.4),
      checkIn('2026-08-21', '19:00', 3, 7.5, true), checkIn('2026-08-22', '08:00', 3, 7.7),
    ];
    expect(deriveProactiveInsights(data)[0]).toMatchObject({ kind: 'late-meal-sleep', evidenceDays: 3 });
  });

  it('rate-limits an already shown insight for seven days', () => {
    const data = [
      checkIn('2026-09-07', '12:00', 2), checkIn('2026-09-14', '12:00', 2), checkIn('2026-09-21', '12:00', 2),
      checkIn('2026-09-08', '12:00', 4), checkIn('2026-09-09', '12:00', 4), checkIn('2026-09-10', '12:00', 4),
    ];
    const now = Date.parse('2026-09-22T12:00:00Z');
    const id = deriveProactiveInsights(data, {}, now)[0].id;
    expect(deriveProactiveInsights(data, markInsightShown({}, id, now), now + 6 * 86400000)).toEqual([]);
    expect(deriveProactiveInsights(data, markInsightShown({}, id, now), now + 8 * 86400000)).toHaveLength(1);
  });

  it('respects not-helpful feedback instead of nagging again', () => {
    const data = [
      checkIn('2026-09-07', '12:00', 2), checkIn('2026-09-14', '12:00', 2), checkIn('2026-09-21', '12:00', 2),
      checkIn('2026-09-08', '12:00', 4), checkIn('2026-09-09', '12:00', 4), checkIn('2026-09-10', '12:00', 4),
    ];
    const id = deriveProactiveInsights(data)[0].id;
    expect(deriveProactiveInsights(data, recordInsightFeedback({}, id, 'not-helpful'))).toEqual([]);
  });
});
