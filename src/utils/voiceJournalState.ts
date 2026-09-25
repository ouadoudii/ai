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

function isExplicitMealReplacement(existing: string, incoming: string, transcript?: string): boolean {
  const text = normalize(transcript);
  const oldMeal = normalize(existing);
  const newMeal = normalize(incoming);
  if (!text || !oldMeal || !newMeal || oldMeal === newMeal) return false;
  if (!text.includes(oldMeal) || !text.includes(newMeal)) return false;
  const escapedOld = oldMeal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedNew = newMeal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const correctionPatterns = [
    new RegExp(`(?:not|nicht|pas)\\s+(?:the\\s+|der\\s+|die\\s+|das\\s+)?${escapedOld}[\\s,،;:-]{0,80}(?:but|sondern|mais)\\s+(?:the\\s+|der\\s+|die\\s+|das\\s+)?${escapedNew}`, 'iu'),
    new RegExp(`${escapedNew}[\\s,،;:-]{0,80}(?:not|nicht|pas)\\s+(?:the\\s+|der\\s+|die\\s+|das\\s+)?${escapedOld}`, 'iu'),
    new RegExp(`(?:ماشي|مش|ليس)\\s*${escapedOld}[\\s,،;:-]{0,80}(?:بل|ولكن|لكن)\\s*${escapedNew}`, 'u'),
    new RegExp(`${escapedNew}[\\s,،;:-]{0,80}(?:ماشي|مش|ليس)\\s*${escapedOld}`, 'u'),
  ];
  return correctionPatterns.some(pattern => pattern.test(text));
}

function isExplicitNoMealCorrection(transcript?: string): boolean {
  const text = normalize(transcript);
  if (!text) return false;
  return [
    /(?:did(?:n't| not)|haven't|have not)\s+(?:eat|eaten|have)\b.*\b(?:breakfast|lunch|dinner)\b/iu,
    /\b(?:breakfast|lunch|dinner)\b.*(?:nothing|did(?:n't| not) eat)/iu,
    /(?:nichts|nix)\s+gegessen/iu,
    /(?:frühstück|mittag|mittags|abend|abends).*?(?:nichts|nix)\s+gegessen/iu,
    /(?:rien|pas)\s+(?:mangé|mange|manger)/iu,
    /(?:déjeuner|dîner|midi|soir).*?(?:rien|pas)\s+(?:mangé|mange)/iu,
    /(?:ما\s*كلتش|مكلتش|ما\s*أكلتش|لم\s*آكل|ما\s*اكلت|ما\s*أكلت)/u,
    /(?:والو|ولا\s*حاجة|لا\s*شيء).*?(?:فالغدا|الغداء|العشاء|الفطور)/u,
  ].some(pattern => pattern.test(text));
}

function sameMoment(a: FoodMoment, b: FoodMoment): boolean {
  if (a.date !== b.date || a.category !== b.category || normalize(a.title) !== normalize(b.title)) return false;
  if (a.time && b.time) return a.time === b.time;
  return a.category === 'breakfast' || a.category === 'lunch' || a.category === 'dinner';
}

export function mergeVoiceMoments(existing: FoodMoment[], incoming: FoodMoment[]): FoodMoment[] {
  const next = [...existing];
  for (const item of incoming) {
    const index = next.findIndex(current => sameMoment(current, item));
    if (index < 0) { next.unshift(item); continue; }
    const current = next[index];
    next[index] = { ...current, ...item, id: current.id, createdAt: current.createdAt, time: current.time || item.time, notes: mergeVoiceText(current.notes, item.notes), tags: Array.from(new Set([...(current.tags || []), ...(item.tags || [])])) };
  }
  return next;
}

export function mergeVoiceCheckIns(existing: DailyCheckIn[], incoming: DailyCheckIn[], seededIds: ReadonlySet<string> = new Set()): DailyCheckIn[] {
  let next = [...existing];
  for (const item of incoming) {
    const index = next.findIndex(current => current.date === item.date && current.timeOfDay === item.timeOfDay && !seededIds.has(current.id));
    if (index < 0) { next = [item, ...next]; continue; }
    const current = next[index];
    const currentFood = current.food;
    const incomingFood = item.food;
    const clearMeal = Boolean(currentFood && !incomingFood && isExplicitNoMealCorrection(item.wellbeing?.voiceTranscription));
    const replaceMeal = currentFood && incomingFood && isExplicitMealReplacement(currentFood.mealTitle, incomingFood.mealTitle, item.wellbeing?.voiceTranscription);
    const food = clearMeal ? undefined : currentFood && incomingFood
      ? { ...currentFood, ...incomingFood, mealTitle: replaceMeal ? incomingFood.mealTitle : mergeMealTitle(currentFood.mealTitle, incomingFood.mealTitle) }
      : incomingFood || currentFood;
    next[index] = {
      ...current, ...item, id: current.id, createdAt: current.createdAt,
      sleep: { ...(current.sleep || {}), ...(item.sleep || {}) }, food,
      wellbeing: { ...(current.wellbeing || {}), ...(item.wellbeing || {}), note: mergeVoiceText(current.wellbeing?.note, item.wellbeing?.note), voiceTranscription: mergeVoiceText(current.wellbeing?.voiceTranscription, item.wellbeing?.voiceTranscription) },
    };
  }
  return next;
}

export function mergeVoiceJournalState(existingMoments: FoodMoment[], existingCheckIns: DailyCheckIn[], incomingMoments: FoodMoment[], incomingCheckIns: DailyCheckIn[], seededIds: ReadonlySet<string> = new Set()): { moments: FoodMoment[]; checkIns: DailyCheckIn[] } {
  return { moments: mergeVoiceMoments(existingMoments, incomingMoments), checkIns: mergeVoiceCheckIns(existingCheckIns, incomingCheckIns, seededIds) };
}
