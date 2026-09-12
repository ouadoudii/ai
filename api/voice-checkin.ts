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
    const deterministic=extractMealItemsDeterministic(normalizeDeterministicFallbackTranscript(transcript));
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
