import { FoodMoment, DailyCheckIn, NutritionTypeProfile, CoachFeedback } from './types';
import { analyzeNutritionType as fallbackAnalyze } from './utils/nutritionTypeEngine';
import { getCoachChatResponse as fallbackChat } from './utils/coachEngine';

export type VoiceLanguage = 'ar' | 'en' | 'de';

export interface VoiceMealEntry {
  category: string;
  timeOfDay: string;
  time: string;
  mealTitle: string;
  mealItems: string[];
  hungerBefore: number;
  fullnessAfter: number;
}

export interface VoiceWellbeingEntry {
  timeOfDay: string;
  energyLevel: number;
  mood: string;
  stressLevel: number;
  waterGlasses: number;
  note: string;
}

export interface VoiceCheckInResult {
  coachFeedback: CoachFeedback;
  extractedData?: {
    mealTitle?: string;
    mealItems?: string[];
    mealCategory?: string;
    mealContext?: string;
    meals?: VoiceMealEntry[];
    sleepHours?: number | null;
    sleepQuality?: number;
    wakeFeeling?: string;
    wellbeingEntries?: VoiceWellbeingEntry[];
    energyLevel?: number;
    mood?: string;
    hungerBefore?: number;
    fullnessAfter?: number;
  };
}

export async function transcribeRecordedAudio(blob:Blob,_language:VoiceLanguage):Promise<string>{
  if (!blob.size) throw new Error('Empty audio');
  const contentType=blob.type||'audio/webm';
  const res=await fetch('/api/transcribe-audio',{method:'POST',headers:{'Content-Type':contentType},body:blob});
  if(!res.ok)throw new Error(`Transcription API returned status ${res.status}`);
  const data=await res.json();
  const text=typeof data?.text==='string'?data.text.trim():'';
  if(!text)throw new Error('Empty transcript');
  return text;
}

export async function processVoiceCheckIn(transcript:string,timeOfDay:string,userArchetype?:string,language:VoiceLanguage='en'):Promise<VoiceCheckInResult>{
  try {
    const currentHour=new Date().getHours();
    const res=await fetch('/api/voice-checkin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({transcript,timeOfDay,userArchetype,currentHour,language})});
    if(!res.ok)throw new Error(`API returned status ${res.status}`);
    return await res.json();
  } catch(error) {
    console.warn('Backend /api/voice-checkin not reachable, using client fallback:',error);
    const feedback = language==='ar'
      ? {title:'تسجلات الرسالة الصوتية 💚',message:'سمعتك وسجلت الرسالة. تقدر تصحح التفاصيل يدوياً.',type:'praise' as const,badge:'تسجيل بالصوت',habitScore:92}
      : language==='de'
        ? {title:'Sprachnotiz gespeichert 💚',message:`Danke fürs Teilen. Cary hat „${transcript.slice(0,80)}...“ für dein Tagebuch gespeichert.`,type:'praise' as const,badge:'Cary Check-in',habitScore:92}
        : {title:'Voice note captured 💚',message:`Thanks for sharing. Cary captured “${transcript.slice(0,80)}...” for your journal.`,type:'praise' as const,badge:'Cary Check-in',habitScore:92};
    return {coachFeedback:feedback,extractedData:{}};
  }
}

export async function fetchServerNutritionArchetype(moments:FoodMoment[],checkIns:DailyCheckIn[]=[]):Promise<NutritionTypeProfile>{return fallbackAnalyze(moments,checkIns);}

export async function askGeminiCoach(query:string,moments:FoodMoment[],checkIns:DailyCheckIn[]=[],userArchetype?:string):Promise<string>{
  try{const res=await fetch('/api/coach-chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query,moments,checkIns,userArchetype})});if(!res.ok)throw new Error(`API returned status ${res.status}`);const data=await res.json();return data.reply||'Ich bin immer für dich da. Wie kann ich dich heute unterstützen?';}catch(error){console.warn('Backend /api/coach-chat not reachable, using local response fallback:',error);return fallbackChat(query,moments);}
}

export async function fetchFoodAutocomplete(input:{query:string;category:string;language:'en'|'ar';country?:string|null}):Promise<string[]>{
  const query=input.query.trim();if(query.length<2)return[];
  try{const res=await fetch('/api/food-autocomplete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query,category:input.category,language:input.language,country:input.country||null})});if(!res.ok)return[];const data=await res.json();return Array.isArray(data?.suggestions)?data.suggestions.filter((v:unknown)=>typeof v==='string').slice(0,5):[];}catch{return[]}
}
