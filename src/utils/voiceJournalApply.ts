import { DailyCheckIn, FoodMoment, FoodMood, MomentCategory, TimeOfDayPhase } from '../types';
import { VoiceCheckInResult, VoiceMealEntry, VoiceWellbeingEntry } from '../apiClient';
import { getLocalDateKey } from './dateKey';

const mealCategories = new Set<MomentCategory>(['breakfast','lunch','dinner','snack','dessert','coffee','drinks']);
const phases = new Set<TimeOfDayPhase>(['morning','midday','evening']);

function validPhase(value: string): TimeOfDayPhase | null {
  return phases.has(value as TimeOfDayPhase) ? value as TimeOfDayPhase : null;
}

function categoryFor(meal: VoiceMealEntry): MomentCategory {
  if (mealCategories.has(meal.category as MomentCategory)) return meal.category as MomentCategory;
  if (meal.timeOfDay === 'morning') return 'breakfast';
  if (meal.timeOfDay === 'midday') return 'lunch';
  if (meal.timeOfDay === 'evening') return 'dinner';
  return 'snack';
}

function foodMood(value: string): FoodMood | undefined {
  return ['energized','satisfied','light','indulgent','comfort','joyful'].includes(value) ? value as FoodMood : undefined;
}

function clampScore(value: number | undefined, max = 5): number | undefined {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.max(1, Math.min(max, n));
}

function labelFor(category: MomentCategory, language: 'ar'|'en') {
  const ar: Record<string,string> = {breakfast:'الفطور',lunch:'الغداء',dinner:'العشاء',snack:'وجبة خفيفة',dessert:'حلويات',coffee:'قهوة',drinks:'مشروب'};
  const en: Record<string,string> = {breakfast:'Breakfast',lunch:'Lunch',dinner:'Dinner',snack:'Snack',dessert:'Dessert',coffee:'Coffee',drinks:'Drink'};
  return (language === 'ar' ? ar : en)[category] || category;
}

export function buildVoiceJournalEntries(
  result: VoiceCheckInResult,
  transcript: string,
  language: 'ar'|'en',
  now = new Date(),
): { moments: FoodMoment[]; checkIns: DailyCheckIn[] } {
  const data = result.extractedData || {};
  const date = getLocalDateKey(now);
  const base = now.getTime();
  const meals: VoiceMealEntry[] = Array.isArray(data.meals) && data.meals.length
    ? data.meals
    : (Array.isArray(data.mealItems) && data.mealItems.length ? [{
        category: data.mealCategory || '', timeOfDay: '', time: '', mealTitle: data.mealTitle || data.mealItems.join(' · '), mealItems: data.mealItems,
        hungerBefore: data.hungerBefore || 0, fullnessAfter: data.fullnessAfter || 0,
      }] : []);

  const moments = meals.filter(meal => Array.isArray(meal.mealItems) && meal.mealItems.length > 0).map((meal,index) => {
    const category = categoryFor(meal);
    return {
      id: `voice-moment-${base}-${index}`,
      title: meal.mealTitle || meal.mealItems.join(' · '),
      label: labelFor(category, language),
      category,
      date,
      time: /^\d{2}:\d{2}$/.test(meal.time || '') ? meal.time : '',
      location: language === 'ar' ? 'غير محدد' : 'Not specified',
      locationCategory: 'home' as const,
      imageUrl: '',
      rating: 5,
      mood: 'satisfied' as FoodMood,
      ...(clampScore(meal.hungerBefore) ? { hungerLevel: clampScore(meal.hungerBefore) } : {}),
      ...(clampScore(meal.fullnessAfter) ? { fullnessLevel: clampScore(meal.fullnessAfter) } : {}),
      coachFeedback: result.coachFeedback,
      notes: language === 'ar' ? 'أضيفت من رسالة صوتية' : 'Added from a voice note',
      tags: ['Voice', meal.timeOfDay || category],
      createdAt: base + index,
    } satisfies FoodMoment;
  });

  type PartialCheck = { phase: TimeOfDayPhase; energyLevel?:number; mood?:FoodMood; stressLevel?:number; waterGlasses?:number; note?:string; sleep?:DailyCheckIn['sleep'] };
  const grouped = new Map<TimeOfDayPhase, PartialCheck>();
  const ensure = (phase: TimeOfDayPhase) => {
    if (!grouped.has(phase)) grouped.set(phase,{phase});
    return grouped.get(phase)!;
  };

  const wellbeing: VoiceWellbeingEntry[] = Array.isArray(data.wellbeingEntries) ? data.wellbeingEntries : [];
  for (const entry of wellbeing) {
    const phase = validPhase(entry.timeOfDay) || (now.getHours() < 11 ? 'morning' : now.getHours() < 16 ? 'midday' : 'evening');
    const target = ensure(phase);
    const energy = clampScore(entry.energyLevel);
    const stress = clampScore(entry.stressLevel);
    const water = clampScore(entry.waterGlasses,30);
    if (energy !== undefined) target.energyLevel = energy;
    const mood = foodMood(entry.mood);
    if (mood) target.mood = mood;
    if (stress !== undefined) target.stressLevel = stress;
    if (water !== undefined) target.waterGlasses = water;
    if (entry.note) target.note = [target.note, entry.note].filter(Boolean).join(' · ');
  }

  const sleepHours = Number(data.sleepHours || 0);
  const sleepQuality = clampScore(data.sleepQuality);
  const wake = ['refreshed','normal','tired','exhausted'].includes(data.wakeFeeling || '') ? data.wakeFeeling as NonNullable<DailyCheckIn['sleep']>['wakeFeeling'] : undefined;
  if (sleepHours > 0 || sleepQuality || wake) {
    const morning = ensure('morning');
    morning.sleep = {
      ...(sleepHours > 0 ? { durationHours: Math.min(24,sleepHours) } : {}),
      ...(sleepQuality ? { quality: sleepQuality } : {}),
      ...(wake ? { wakeFeeling: wake } : {}),
    };
  }

  const checkIns = Array.from(grouped.values()).map((entry,index) => ({
    id: `voice-checkin-${base}-${index}`,
    date,
    time: '',
    timeOfDay: entry.phase,
    ...(entry.sleep ? { sleep: entry.sleep } : {}),
    wellbeing: {
      ...(entry.energyLevel !== undefined ? { energyLevel: entry.energyLevel } : {}),
      ...(entry.mood ? { mood: entry.mood } : {}),
      ...(entry.stressLevel !== undefined ? { stressLevel: entry.stressLevel } : {}),
      ...(entry.waterGlasses !== undefined ? { waterGlasses: entry.waterGlasses } : {}),
      ...(entry.note ? { note: entry.note } : {}),
      voiceTranscription: transcript,
    },
    coachSummary: language === 'ar' ? 'استخرج تلقائياً من رسالتك الصوتية.' : 'Automatically extracted from your voice note.',
    createdAt: base + 100 + index,
  } satisfies DailyCheckIn));

  return { moments, checkIns };
}
