import { FoodMoment, DailyCheckIn, NutritionTypeProfile, CoachFeedback } from './types';
import { analyzeNutritionType as fallbackAnalyze } from './utils/nutritionTypeEngine';
import { getCoachChatResponse as fallbackChat } from './utils/coachEngine';

export interface VoiceCheckInResult {
  coachFeedback: CoachFeedback;
  extractedData?: {
    mealTitle?: string;
    mealCategory?: string;
    sleepHours?: number | null;
    energyLevel?: number;
    mood?: string;
    hungerBefore?: number;
    fullnessAfter?: number;
  };
}

export async function processVoiceCheckIn(
  transcript: string,
  timeOfDay: string,
  userArchetype?: string
): Promise<VoiceCheckInResult> {
  try {
    const currentHour = new Date().getHours();
    const res = await fetch('/api/voice-checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, timeOfDay, userArchetype, currentHour }),
    });
    if (!res.ok) throw new Error(`API returned status ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn('Backend /api/voice-checkin not reachable, using client fallback:', error);
    return {
      coachFeedback: {
        title: 'Sprachnachricht erfasst 💚',
        message: `Danke für dein Teilen! „${transcript.slice(0, 80)}...“ — Cary nimmt diesen Check-in in dein längerfristiges Muster auf.`,
        type: 'praise',
        badge: 'Cary Check-in',
        habitScore: 92,
      },
      extractedData: { energyLevel: 4, mood: 'energized' },
    };
  }
}

/**
 * Nutrition type analysis intentionally runs through the deterministic local
 * multi-day engine. This keeps the unlock threshold and confidence calculation
 * identical online and offline and prevents an AI response from assigning a
 * type prematurely. Gemini may add coaching language elsewhere, but it does
 * not decide the user's nutrition type.
 */
export async function fetchServerNutritionArchetype(
  moments: FoodMoment[],
  checkIns: DailyCheckIn[] = []
): Promise<NutritionTypeProfile> {
  return fallbackAnalyze(moments, checkIns);
}

export async function askGeminiCoach(
  query: string,
  moments: FoodMoment[],
  checkIns: DailyCheckIn[] = [],
  userArchetype?: string
): Promise<string> {
  try {
    const res = await fetch('/api/coach-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, moments, checkIns, userArchetype }),
    });
    if (!res.ok) throw new Error(`API returned status ${res.status}`);
    const data = await res.json();
    return data.reply || 'Ich bin immer für dich da. Wie kann ich dich heute unterstützen?';
  } catch (error) {
    console.warn('Backend /api/coach-chat not reachable, using local response fallback:', error);
    return fallbackChat(query, moments);
  }
}
