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
