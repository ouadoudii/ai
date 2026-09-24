import { DailyCheckIn, FoodMoment } from '../types';

const normalize = (value?: string) => (value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase();

export function mergeVoiceText(existing?: string, incoming?: string): string | undefined {
  const first = (existing || '').trim();
  const second = (incoming || '').trim();
  if (!first) return second || undefined;
  if (!second) return first;
  const a = normalize(first);
  const b = normalize(second);
  if (a === b || a.includes(b)) return first;
  if (b.includes(a)) return second;
  return `${first}\n${second}`;
}

function mergeMealTitle(existing: string, incoming: string): string {
  const first = existing.trim();
  const second = incoming.trim();
  if (!first) return second;
  if (!second) return first;
  const a = normalize(first);
  const b = normalize(second);
  if (a === b || a.includes(b)) return first;
  if (b.includes(a)) return second;
  return `${first} · ${second}`;
}

function sameMoment(a: FoodMoment, b: FoodMoment): boolean {
  if (a.date !== b.date || a.category !== b.category || normalize(a.title) !== normalize(b.title)) return false;
  if (a.time && b.time) return a.time === b.time;
  // Missing time is not identity evidence for repeatable foods/drinks: preserve the
  // occurrence instead of silently losing it. Primary meals carry stronger phase
  // identity and may be restated by an untimed whole-day recap, so keep the
  // established recap reconciliation for breakfast/lunch/dinner.
  return a.category === 'breakfast' || a.category === 'lunch' || a.category === 'dinner';
}

export function mergeVoiceMoments(existing: FoodMoment[], incoming: FoodMoment[]): FoodMoment[] {
  const next = [...existing];
  for (const item of incoming) {
    const index = next.findIndex(current => sameMoment(current, item));
    if (index < 0) {
      next.unshift(item);
      continue;
    }
    const current = next[index];
    next[index] = {
      ...current,
      ...item,
      id: current.id,
      createdAt: current.createdAt,
      time: current.time || item.time,
      notes: mergeVoiceText(current.notes, item.notes),
      tags: Array.from(new Set([...(current.tags || []), ...(item.tags || [])])),
    };
  }
  return next;
}

export function mergeVoiceCheckIns(
  existing: DailyCheckIn[],
  incoming: DailyCheckIn[],
  seededIds: ReadonlySet<string> = new Set(),
): DailyCheckIn[] {
  let next = [...existing];
  for (const item of incoming) {
    const index = next.findIndex(current =>
      current.date === item.date && current.timeOfDay === item.timeOfDay && !seededIds.has(current.id),
    );
    if (index < 0) {
      next = [item, ...next];
      continue;
    }
    const current = next[index];
    const currentFood = current.food;
    const incomingFood = item.food;
    const food = currentFood && incomingFood
      ? {
          ...currentFood,
          ...incomingFood,
          mealTitle: mergeMealTitle(currentFood.mealTitle, incomingFood.mealTitle),
        }
      : incomingFood || currentFood;
    next[index] = {
      ...current,
      ...item,
      id: current.id,
      createdAt: current.createdAt,
      sleep: { ...(current.sleep || {}), ...(item.sleep || {}) },
      food,
      wellbeing: {
        ...(current.wellbeing || {}),
        ...(item.wellbeing || {}),
        note: mergeVoiceText(current.wellbeing?.note, item.wellbeing?.note),
        voiceTranscription: mergeVoiceText(
          current.wellbeing?.voiceTranscription,
          item.wellbeing?.voiceTranscription,
        ),
      },
    };
  }
  return next;
}

export function mergeVoiceJournalState(
  existingMoments: FoodMoment[],
  existingCheckIns: DailyCheckIn[],
  incomingMoments: FoodMoment[],
  incomingCheckIns: DailyCheckIn[],
  seededIds: ReadonlySet<string> = new Set(),
) {
  return {
    moments: mergeVoiceMoments(existingMoments, incomingMoments),
    checkIns: mergeVoiceCheckIns(existingCheckIns, incomingCheckIns, seededIds),
  };
}
