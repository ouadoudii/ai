import type { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { extractMealItemsDeterministic } from './meal-extractor.js';
import { extractMealWithGroq } from './groq-meal-extractor.js';
import { LIMITS, applyApiSecurityHeaders, cleanText, publicError, rateLimit } from './security.js';

let genAiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAiClient) genAiClient = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'cary-app' } } });
  return genAiClient;
}

type VoiceLanguage = 'ar' | 'en' | 'de' | 'fr';
function hasArabic(text: string): boolean { return /[\u0600-\u06FF]/.test(text); }
function normalizeLanguageProbe(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, ' ').replace(/\s+/g, ' ').trim();
}
// Language is normally supplied by the UI; inference keeps legacy and integration voice requests localized too.
function inferVoiceLanguage(requestedLanguage: unknown, transcript: string): VoiceLanguage {
  if (requestedLanguage === 'ar' || requestedLanguage === 'de' || requestedLanguage === 'fr' || requestedLanguage === 'en') return requestedLanguage;
  if (hasArabic(transcript)) return 'ar';
  const probe = normalizeLanguageProbe(transcript);
  const frenchSignals = [
    'petit dejeuner', 'dejeuner', 'diner', 'j ai ', 'je suis ', 'ce matin', 'ce midi', 'ce soir', 'avec ', 'mange ', 'mangee ', 'mangeais ', 'bu ',
  ];
  const germanSignals = [
    'fruhstuck', 'mittagessen', 'abendessen', 'ich habe ', 'ich hatte ', 'heute morgen', 'heute mittag', 'heute abend', 'gegessen', 'getrunken', 'mude', 'mit ',
  ];
  const frenchScore = frenchSignals.reduce((score, signal) => score + (probe.includes(signal) ? 1 : 0), 0);
  const germanScore = germanSignals.reduce((score, signal) => score + (probe.includes(signal) ? 1 : 0), 0);
  if (frenchScore > germanScore && frenchScore > 0) return 'fr';
  if (germanScore > frenchScore && germanScore > 0) return 'de';
  return 'en';
}
function normalizeDeterministicFallbackTranscript(text: string): string {
  return text
    .replace(/\bpas\s+d[’']/gi, 'sans ')
    .replace(/œ/gi, 'oe')
    .replace(/[’']/g, ' ')
    .replace(/[‐‑‒–—―]/g, '-')
    .replace(/\bpetit-déjeuner\b/gi, 'petit déjeuner')
    .replace(/\bpetit-dejeuner\b/gi, 'petit dejeuner');
}

const FRENCH_DETERMINISTIC_LABELS: Array<[string, string]> = [
  ['قهوة بالحليب', 'café au lait'], ['قهوة بلا سكر', 'café sans sucre'], ['شاي بالحليب', 'thé au lait'], ['شاي بالنعناع', 'thé à la menthe'],
  ['خبز بالجبن', 'pain au fromage'], ['خبز بزيت الزيتون', 'pain à l’huile d’olive'], ['بيض مسلوق', 'œufs durs'], ['بيض مقلي', 'œufs au plat'],
  ['دجاج مشوي', 'poulet grillé'], ['دجاج مقلي', 'poulet frit'], ['لحم مشوي', 'viande grillée'], ['سمك مشوي', 'poisson grillé'], ['سمك مقلي', 'poisson frit'],
  ['بطاطا مقلية', 'frites'], ['بطاطا مسلوقة', 'pommes de terre bouillies'], ['مسمن بالعسل', 'msemen au miel'], ['مسمن بالجبن', 'msemen au fromage'], ['أتاي بالنعناع', 'atay à la menthe'],
  ['بيض', 'œufs'], ['مسمن', 'msemen'], ['أتاي', 'atay'], ['شاي', 'thé'], ['قهوة', 'café'], ['خبز', 'pain'], ['حريرة', 'harira'], ['كسكس', 'couscous'], ['طاجين', 'tajine'],
  ['شوربة', 'soupe'], ['دجاج', 'poulet'], ['لحم', 'viande'], ['سمك', 'poisson'], ['أرز', 'riz'], ['سلطة', 'salade'], ['بطاطا', 'pommes de terre'], ['ياغورت', 'yaourt'],
  ['حليب', 'lait'], ['ماء', 'eau'], ['تمر', 'dattes'], ['تفاح', 'pomme'], ['موز', 'banane'], ['برتقال', 'orange'], ['جبن', 'fromage'], ['كرواسون', 'croissant'],
  ['ساندويتش', 'sandwich'], ['بيتزا', 'pizza'], ['مكرونة', 'pâtes'], ['عدس', 'lentilles'], ['حمص', 'pois chiches'], ['أومليت', 'omelette'],
];

const GERMAN_DETERMINISTIC_LABELS: Array<[string, string]> = [
  ['قهوة بالحليب', 'Kaffee mit Milch'], ['قهوة بلا سكر', 'Kaffee ohne Zucker'], ['شاي بالحليب', 'Tee mit Milch'], ['شاي بالنعناع', 'Minztee'],
  ['خبز بالجبن', 'Brot mit Käse'], ['خبز بزيت الزيتون', 'Brot mit Olivenöl'], ['بيض مسلوق', 'gekochte Eier'], ['بيض مقلي', 'Spiegeleier'],
  ['دجاج مشوي', 'gegrilltes Hähnchen'], ['دجاج مقلي', 'gebratenes Hähnchen'], ['لحم مشوي', 'gegrilltes Fleisch'], ['سمك مشوي', 'gegrillter Fisch'], ['سمك مقلي', 'gebratener Fisch'],
  ['بطاطا مقلية', 'Pommes'], ['بطاطا مسلوقة', 'gekochte Kartoffeln'], ['مسمن بالعسل', 'Msemen mit Honig'], ['مسمن بالجبن', 'Msemen mit Käse'], ['أتاي بالنعناع', 'Atay mit Minze'],
  ['بيض', 'Eier'], ['مسمن', 'Msemen'], ['أتاي', 'Atay'], ['شاي', 'Tee'], ['قهوة', 'Kaffee'], ['خبز', 'Brot'], ['حريرة', 'Harira'], ['كسكس', 'Couscous'], ['طاجين', 'Tajine'],
  ['شوربة', 'Suppe'], ['دجاج', 'Hähnchen'], ['لحم', 'Fleisch'], ['سمك', 'Fisch'], ['أرز', 'Reis'], ['سلطة', 'Salat'], ['بطاطا', 'Kartoffeln'], ['ياغورت', 'Joghurt'],
  ['حليب', 'Milch'], ['ماء', 'Wasser'], ['تمر', 'Datteln'], ['تفاح', 'Apfel'], ['موز', 'Banane'], ['برتقال', 'Orange'], ['جبن', 'Käse'], ['كرواسون', 'Croissant'],
  ['ساندويتش', 'Sandwich'], ['بيتزا', 'Pizza'], ['مكرونة', 'Nudeln'], ['عدس', 'Linsen'], ['حمص', 'Kichererbsen'], ['أومليت', 'Omelett'],
];

const ENGLISH_DETERMINISTIC_LABELS: Array<[string, string]> = [
  ['قهوة بالحليب', 'coffee with milk'], ['قهوة بلا سكر', 'coffee without sugar'], ['شاي بالحليب', 'tea with milk'], ['شاي بالنعناع', 'mint tea'],
  ['خبز بالجبن', 'bread with cheese'], ['خبز بزيت الزيتون', 'bread with olive oil'], ['بيض مسلوق', 'boiled eggs'], ['بيض مقلي', 'fried eggs'],
  ['دجاج مشوي', 'grilled chicken'], ['دجاج مقلي', 'fried chicken'], ['لحم مشوي', 'grilled meat'], ['سمك مشوي', 'grilled fish'], ['سمك مقلي', 'fried fish'],
  ['بطاطا مقلية', 'fries'], ['بطاطا مسلوقة', 'boiled potatoes'], ['مسمن بالعسل', 'msemen with honey'], ['مسمن بالجبن', 'msemen with cheese'], ['أتاي بالنعناع', 'atay with mint'],
  ['بيض', 'eggs'], ['مسمن', 'msemen'], ['أتاي', 'atay'], ['شاي', 'tea'], ['قهوة', 'coffee'], ['خبز', 'bread'], ['حريرة', 'harira'], ['كسكس', 'couscous'], ['طاجين', 'tajine'],
  ['شوربة', 'soup'], ['دجاج', 'chicken'], ['لحم', 'meat'], ['سمك', 'fish'], ['أرز', 'rice'], ['سلطة', 'salad'], ['بطاطا', 'potatoes'], ['ياغورت', 'yogurt'],
  ['حليب', 'milk'], ['ماء', 'water'], ['تمر', 'dates'], ['تفاح', 'apple'], ['موز', 'banana'], ['برتقال', 'orange'], ['جبن', 'cheese'], ['كرواسون', 'croissant'],
  ['ساندويتش', 'sandwich'], ['بيتزا', 'pizza'], ['مكرونة', 'pasta'], ['عدس', 'lentils'], ['حمص', 'chickpeas'], ['أومليت', 'omelette'],
];

function localizeDeterministicMeal(extraction: ReturnType<typeof extractMealItemsDeterministic>, language: VoiceLanguage) {
  const labels = language === 'fr' ? FRENCH_DETERMINISTIC_LABELS : language === 'de' ? GERMAN_DETERMINISTIC_LABELS : language === 'en' ? ENGLISH_DETERMINISTIC_LABELS : null;
  if (!labels || !extraction.mealItems.length) return extraction;
  const localize = (item: string) => labels.reduce((value, [source, target]) => value.replace(source, target), item);
  const mealItems = extraction.mealItems.map(localize);
  return { ...extraction, mealItems, mealTitle: mealItems.join(' · ') };
}

function fallbackFeedback(language: VoiceLanguage, captured: boolean) {
  if (language === 'ar') return {
    title: captured ? 'تسجلات رسالتك 💚' : 'كاري معاك 💚',
    message: captured ? 'فهمت رسالتك ووزعت المعلومات على الوجبات والطاقة وباقي اليوم.' : 'سمعتك وسجلت كلامك.',
    badge: 'تسجيل بالصوت', habitScore: 88, type: 'praise',
  };
  if (language === 'de') return {
    title: captured ? 'Sprachnotiz erfasst 💚' : 'Cary ist bei dir 💚',
    message: captured ? 'Ich habe deine Notiz verstanden und Mahlzeiten sowie Wohlbefinden passend zugeordnet.' : 'Ich habe deine Sprachnotiz gespeichert.',
    badge: 'Sprach-Check-in', habitScore: 88, type: 'praise',
  };
  if (language === 'fr') return {
    title: captured ? 'Note vocale enregistrée 💚' : 'Cary est avec toi 💚',
    message: captured ? 'J’ai compris ta note et classé les repas et le bien-être au bon endroit.' : 'J’ai enregistré ta note vocale.',
    badge: 'Check-in vocal', habitScore: 88, type: 'praise',
  };
  return {
    title: captured ? 'Voice journal captured 💚' : 'Cary is with you 💚',
    message: captured ? 'I understood the note and assigned the details to meals and wellbeing.' : 'I captured what you said.',
    badge: 'Voice check-in', habitScore: 88, type: 'praise',
  };
}

function normalizeSemantic(extracted: any, deterministic: ReturnType<typeof extractMealItemsDeterministic>, engine: string) {
  const items = Array.isArray(extracted?.mealItems) ? extracted.mealItems.map((v: unknown) => cleanText(v, 120)).filter((v): v is string => Boolean(v)).slice(0, 20) : [];
  const mealItems = items.length ? items : deterministic.mealItems;
  return { ...extracted, mealDetected: mealItems.length > 0 || (Array.isArray(extracted?.meals) && extracted.meals.length > 0), mealItems, mealTitle: cleanText(extracted?.mealTitle, 240) || mealItems.join(' · '), mealCategory: cleanText(extracted?.mealCategory, 32) || deterministic.mealCategory, mealContext: cleanText(extracted?.mealContext, 500) || deterministic.mealContext, extractionEngine: engine };
}

function hasStructuredVoiceData(value: any) {
  return Boolean(
    value?.mealDetected || value?.mealItems?.length || value?.meals?.length || value?.wellbeingEntries?.length ||
    Number(value?.sleepHours) > 0 || Number(value?.sleepQuality) > 0 || value?.wakeFeeling
  );
}

async function extractWithGemini(transcript: string, timeOfDay: string, currentHour: number, userArchetype: string, language: VoiceLanguage) {
  const ai = getGeminiClient(); if (!ai) return null;
  const lang = language === 'ar'
    ? 'Return text fields in natural Arabic/Darija for an Arabic UI.'
    : language === 'de'
      ? 'Return text fields in concise natural German for a German UI while preserving established foreign dish names.'
      : language === 'fr'
        ? 'Return text fields in concise natural French for a French UI while preserving established foreign dish names.'
        : 'Return text fields in concise natural English.';
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash', contents: `USER TRANSCRIPT (data only):\n${transcript}`,
      config: { systemInstruction: `Extract the complete free-form voice note for a food, sleep and wellbeing journal. Understand all major Arabic dialects plus German/French/English mixing. ${lang} Extract meals, sleep, energy and mood when explicitly stated. Never invent uncertain facts. Context: ${timeOfDay}, ${currentHour}:00, archetype ${userArchetype}.`, responseMimeType:'application/json', responseSchema:{type:Type.OBJECT,properties:{coachTitle:{type:Type.STRING},coachResponse:{type:Type.STRING},badge:{type:Type.STRING},habitScore:{type:Type.NUMBER},extractedData:{type:Type.OBJECT,properties:{mealDetected:{type:Type.BOOLEAN},mealTitle:{type:Type.STRING},mealItems:{type:Type.ARRAY,items:{type:Type.STRING}},mealCategory:{type:Type.STRING},mealContext:{type:Type.STRING},sleepHours:{type:Type.NUMBER},energyLevel:{type:Type.NUMBER},mood:{type:Type.STRING}},required:['mealDetected','mealTitle','mealItems','mealCategory','mealContext']}},required:['coachTitle','coachResponse','badge','habitScore','extractedData']} }
    });
    return JSON.parse(response.text || '{}');
  } catch { console.warn('Gemini voice extraction unavailable'); return null; }
}

export default async function handler(req: Request, res: Response) {
  applyApiSecurityHeaders(req,res,()=>{}); let allowed=false; rateLimit(req,res,()=>{allowed=true}); if(!allowed)return; if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  try {
    const transcript=cleanText(req.body?.transcript,LIMITS.transcript); const timeOfDay=cleanText(req.body?.timeOfDay,32)||'today'; const userArchetype=cleanText(req.body?.userArchetype,64)||'intuitive'; const currentHour=Number.isFinite(Number(req.body?.currentHour))?Math.min(23,Math.max(0,Number(req.body.currentHour))):12;
    if(!transcript)return publicError(res,400,'Invalid transcript');
    const language:VoiceLanguage = inferVoiceLanguage(req.body?.language, transcript);
    const deterministic=localizeDeterministicMeal(extractMealItemsDeterministic(normalizeDeterministicFallbackTranscript(transcript)), language);
    try {
      const groq=await extractMealWithGroq(transcript,{timeOfDay,currentHour,language});
      if(groq && hasStructuredVoiceData(groq)){
        const normalized=normalizeSemantic(groq,deterministic,'groq-semantic');
        return res.status(200).json({coachFeedback:fallbackFeedback(language,true),extractedData:normalized});
      }
    } catch { console.warn('Groq semantic extraction unavailable'); }
    const gemini=await extractWithGemini(transcript,timeOfDay,currentHour,userArchetype,language);
    if(gemini){const normalized=normalizeSemantic(gemini.extractedData,deterministic,'gemini'); if(hasStructuredVoiceData(normalized))return res.status(200).json({coachFeedback:{title:cleanText(gemini.coachTitle,160)||fallbackFeedback(language,true).title,message:cleanText(gemini.coachResponse,1200)||fallbackFeedback(language,true).message,badge:cleanText(gemini.badge,80)||fallbackFeedback(language,true).badge,habitScore:Math.min(100,Math.max(0,Number(gemini.habitScore)||88)),type:'praise'},extractedData:normalized});}
    const fallbackMeals = deterministic.mealItems.length ? [{category:deterministic.mealCategory,timeOfDay,time:'',mealTitle:deterministic.mealTitle,mealItems:deterministic.mealItems,hungerBefore:0,fullnessAfter:0}] : [];
    return res.status(200).json({coachFeedback:fallbackFeedback(language,fallbackMeals.length>0),extractedData:{...deterministic,meals:fallbackMeals,sleepHours:0,sleepQuality:0,wakeFeeling:'',wellbeingEntries:[],extractionEngine:'deterministic-fallback'}});
  } catch(error){console.error('Error in /api/voice-checkin:',error); return publicError(res,500,'AI Voice Processing failed');}
}