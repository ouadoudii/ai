import { describe, expect, it } from 'vitest';
import { DailyCheckIn } from './types';
import { deriveLongTermProgress } from './utils/longTermProgress';

const checkIn = (date: string, energy: number, stress: number, sleep: number, meal = true): DailyCheckIn => ({
  id: `c-${date}-${energy}`,
  date,
  time: '12:00',
  timeOfDay: 'midday',
  sleep: { durationHours: sleep },
  food: meal ? { mealTitle: 'meal', category: 'lunch' } : undefined,
  wellbeing: { energyLevel: energy, stressLevel: stress },
  createdAt: Date.parse(`${date}T12:00:00Z`),
});

describe('deriveLongTermProgress', () => {
  it('waits for enough historical days instead of inventing a trend', () => {
    const data = [1, 2, 3, 4, 5].map(day => checkIn(`2026-09-0${day}`, 3, 3, 7));
    expect(deriveLongTermProgress(data)).toEqual([]);
  });

  it('reports positive and negative changes with observed averages and sample sizes', () => {
    const data = [
      checkIn('2026-08-01', 2, 4, 6), checkIn('2026-08-02', 2, 4, 6), checkIn('2026-08-03', 2, 4, 6),
      checkIn('2026-09-01', 4, 2, 7.5), checkIn('2026-09-02', 4, 2, 7.5), checkIn('2026-09-03', 4, 2, 7.5),
    ];
    const insights = deriveLongTermProgress(data);
    expect(insights.find(i => i.metric === 'energy')).toMatchObject({ direction: 'improved', earlier: 2, recent: 4, earlierDays: 3, recentDays: 3 });
    expect(insights.find(i => i.metric === 'stress')).toMatchObject({ direction: 'improved', earlier: 4, recent: 2 });
    expect(insights.find(i => i.metric === 'sleep')).toMatchObject({ direction: 'improved', earlier: 6, recent: 7.5 });
  });

  it('does not turn tiny variation into a claimed improvement', () => {
    const data = [
      checkIn('2026-08-01', 3, 3, 7), checkIn('2026-08-02', 3, 3, 7), checkIn('2026-08-03', 3, 3, 7),
      checkIn('2026-09-01', 3.1, 3, 7.1), checkIn('2026-09-02', 3.1, 3, 7.1), checkIn('2026-09-03', 3.1, 3, 7.1),
    ];
    expect(deriveLongTermProgress(data).filter(i => i.metric !== 'mealRhythm').every(i => i.direction === 'stable')).toBe(true);
  });
});
