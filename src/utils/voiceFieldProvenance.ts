import { VoiceExplicitField } from '../types';

const fieldPatterns: Record<VoiceExplicitField, RegExp[]> = {
  'sleep.durationHours': [
    /\b(?:slept|sleep|schlaf|geschlafen|dormi|sommeil)\b.*\b\d+(?:[.,]\d+)?\s*(?:h|hours?|stunden?|heures?)\b/iu,
    /(?:نمت|نعست).*?\d+(?:[.,]\d+)?\s*(?:ساعات?|ساعة)/u,
  ],
  'sleep.quality': [/\b(?:sleep quality|slept (?:well|badly)|schlafqualit|gut geschlafen|schlecht geschlafen|bien dormi|mal dormi)\b/iu, /(?:نوم|نعاس).*?(?:مزيان|خايب|جيد|سيئ)/u],
  'sleep.wakeFeeling': [/\b(?:woke|wake|aufgewacht|aufgewacht|réveill|reveille).*(?:refreshed|tired|exhausted|fit|müde|erschöpft|repos|fatigu)/iu, /(?:فقت|استيقظت).*?(?:مرتاح|عيان|متعب|منهك)/u],
  'sleep.wakeCount': [/\b(?:woke|wake|aufgewacht|réveill|reveille)\b.*\b(?:once|twice|\d+|einmal|zweimal|fois)\b/iu, /(?:فقت|استيقظت).*?(?:مرة|مرتين|\d+)/u],
  'sleep.awakeMinutes': [/\b(?:awake|wach|réveill|reveille)\b.*\b\d+\s*(?:minutes?|minuten?)\b/iu, /(?:مستيقظ|فايق).*?\d+\s*(?:دقائق?|دقيقة)/u],
  'wellbeing.energyLevel': [/\b(?:energy|energie|énergie|energetic|energisch)\b/iu, /(?:طاقة|نشاط)/u],
  'wellbeing.mood': [/\b(?:mood|stimmung|humeur)\b/iu, /(?:مزاج|معنويات)/u],
  'wellbeing.stressLevel': [/\b(?:stress|stressed|gestresst|stressé|stresse)\b/iu, /(?:توتر|ضغط|مقلق)/u],
  'wellbeing.waterGlasses': [/\b(?:water|wasser|eau)\b/iu, /(?:ماء|الما|كاس د الما|كؤوس الماء)/u],
};

export function inferVoiceExplicitFields(transcript?: string): VoiceExplicitField[] {
  const text = (transcript || '').trim();
  if (!text) return [];
  return (Object.entries(fieldPatterns) as Array<[VoiceExplicitField, RegExp[]]>)
    .filter(([, patterns]) => patterns.some(pattern => pattern.test(text)))
    .map(([field]) => field);
}

export function normalizeVoiceExplicitFields(fields: unknown, transcript?: string): VoiceExplicitField[] {
  const allowed = new Set(Object.keys(fieldPatterns) as VoiceExplicitField[]);
  const supplied = Array.isArray(fields) ? fields.filter((field): field is VoiceExplicitField => typeof field === 'string' && allowed.has(field as VoiceExplicitField)) : [];
  return Array.from(new Set([...supplied, ...inferVoiceExplicitFields(transcript)]));
}
