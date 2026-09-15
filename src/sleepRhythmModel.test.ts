import { describe, expect, it } from 'vitest';
import type { DailyCheckIn } from './types';

describe('sleep rhythm check-in model', () => {
  it('keeps sleep timing and wake phases alongside duration and quality', () => {
    const checkIn: DailyCheckIn = {
      id: 'sleep-rhythm-example',
      date: '2026-09-15',
      time: '07:30',
      timeOfDay: 'morning',
      sleep: {
        durationHours: 7.25,
        quality: 4,
        bedtime: '23:45',
        wakeTime: '07:15',
        wakeCount: 2,
        awakeMinutes: 18,
        wakeFeeling: 'normal',
      },
      wellbeing: { energyLevel: 3 },
      createdAt: 1,
    };

    expect(checkIn.sleep).toMatchObject({
      bedtime: '23:45',
      wakeTime: '07:15',
      wakeCount: 2,
      awakeMinutes: 18,
    });
  });
});
