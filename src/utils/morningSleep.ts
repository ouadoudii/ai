import { DailyCheckIn } from '../types';

type SleepEntry = NonNullable<DailyCheckIn['sleep']>;

export const buildMorningSleepEntry = (
  durationHours: number,
  quality: number,
  bedtime: string,
  wakeTime: string,
  wakeFeeling: SleepEntry['wakeFeeling'],
): SleepEntry => ({ durationHours, quality, bedtime, wakeTime, wakeFeeling });
