export type CheckInMood = 'good' | 'calm' | 'neutral' | 'low';

export type DailyCheckIn = {
  mood: CheckInMood;
  createdAt: string;
};

export const CHECKIN_STORAGE_KEY = 'nimmapp_checkins_v1';

export function createCheckIn(mood: CheckInMood, now = new Date()): DailyCheckIn {
  return { mood, createdAt: now.toISOString() };
}

export function addCheckIn(checkIns: DailyCheckIn[], mood: CheckInMood, now = new Date()): DailyCheckIn[] {
  return [createCheckIn(mood, now), ...checkIns];
}

export function hasCheckInToday(checkIns: DailyCheckIn[], now = new Date()): boolean {
  const today = now.toISOString().slice(0, 10);
  return checkIns.some(checkIn => checkIn.createdAt.slice(0, 10) === today);
}

export function latestCheckIn(checkIns: DailyCheckIn[]): DailyCheckIn | null {
  return checkIns[0] ?? null;
}
