import { MomentCategory, TimeOfDayPhase } from '../types';

export const PHASE_START_HOUR: Record<TimeOfDayPhase, number> = {
  morning: 5,
  midday: 11,
  evening: 18,
};

export function isPhaseAvailable(phase: TimeOfDayPhase, hour: number): boolean {
  return hour >= PHASE_START_HOUR[phase];
}

export function getAvailablePhases(hour: number): TimeOfDayPhase[] {
  return (['morning','midday','evening'] as TimeOfDayPhase[]).filter(phase => isPhaseAvailable(phase, hour));
}

export function isMealCategoryAvailable(category: MomentCategory, hour: number): boolean {
  if (category === 'breakfast') return hour >= PHASE_START_HOUR.morning;
  if (category === 'lunch') return hour >= PHASE_START_HOUR.midday;
  if (category === 'dinner') return hour >= PHASE_START_HOUR.evening;
  return true;
}

export function getAvailableMealCategories(hour: number, categories: MomentCategory[]): MomentCategory[] {
  return categories.filter(category => isMealCategoryAvailable(category, hour));
}
