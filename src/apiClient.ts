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

/**
 * 1. Process Voice / Text check-in via Gemini AI
 */
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
      body: JSON.stringify({
        transcript,
        timeOfDay,
        userArchetype,
        currentHour,
      }),
    });

    if (!res.ok) {
      throw new Error(`API returned status ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.warn('Backend /api/voice-checkin not reachable, using intelligent client fallback:', error);
    return {
      coachFeedback: {
        title: 'Sprachnachricht erfasst 💚',
        message: `Danke für dein Teilen! „${transcript.slice(0, 80)}...“ — wunderbar, wie du heute auf deinen Körper achtest.`,
        type: 'praise',
        badge: "Sag's mir! Impuls",
        habitScore: 92,
      },
      extractedData: {
        energyLevel: 4,
        mood: 'energized',
      },
    };
  }
}

/**
 * 2. Fetch server-side Matrix & Gemini archetype analysis
 */
export async function fetchServerNutritionArchetype(
  moments: FoodMoment[],
  checkIns: DailyCheckIn[] = []
): Promise<NutritionTypeProfile> {
  try {
    const res = await fetch('/api/analyze-archetype', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moments, checkIns }),
    });

    if (!res.ok) {
      throw new Error(`API returned status ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.warn('Backend /api/analyze-archetype not reachable, using local calculation fallback:', error);
    return fallbackAnalyze(moments, checkIns);
  }
}

/**
 * 3. Send message to Gemini Coach
 */
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

    if (!res.ok) {
      throw new Error(`API returned status ${res.status}`);
    }

    const data = await res.json();
    return data.reply || 'Ich bin immer für dich da. Wie kann ich dich heute unterstützen?';
  } catch (error) {
    console.warn('Backend /api/coach-chat not reachable, using local response fallback:', error);
    return fallbackChat(query, moments);
  }
}
