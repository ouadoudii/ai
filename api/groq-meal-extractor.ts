import { cleanText } from './security.js';

export type SemanticVoiceMeal = {
  category: string;
  timeOfDay: string;
  time: string;
  mealTitle: string;
  mealItems: string[];
  hungerBefore: number;
  fullnessAfter: number;
};

export type SemanticWellbeingEntry = {
  timeOfDay: string;
  energyLevel: number;
  mood: string;
  stressLevel: number;
  waterGlasses: number;
  note: string;
};

export type SemanticMealExtraction = {
  mealDetected: boolean;
  mealTitle: string;
  mealItems: string[];
  mealCategory: string;
  mealContext: string;
  clarificationQuestion: string;
  meals: SemanticVoiceMeal[];
  sleepHours: number;
  sleepQuality: number;
  wakeFeeling: string;
  wellbeingEntries: SemanticWellbeingEntry[];
};

const MEAL_SCHEMA = {
  name: 'voice_journal_extraction', strict: true,
  schema: { type: 'object', additionalProperties: false, properties: {
    mealDetected: { type: 'boolean' }, mealTitle: { type: 'string' }, mealItems: { type: 'array', items: { type: 'string' } }, mealCategory: { type: 'string' }, mealContext: { type: 'string' }, clarificationQuestion: { type: 'string' },
    meals: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { category: { type: 'string' }, timeOfDay: { type: 'string' }, time: { type: 'string' }, mealTitle: { type: 'string' }, mealItems: { type: 'array', items: { type: 'string' } }, hungerBefore: { type: 'number' }, fullnessAfter: { type: 'number' } }, required: ['category','timeOfDay','time','mealTitle','mealItems','hungerBefore','fullnessAfter'] } },
    sleepHours: { type: 'number' }, sleepQuality: { type: 'number' }, wakeFeeling: { type: 'string' }, wellbeingEntries: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { timeOfDay: { type: 'string' }, energyLevel: { type: 'number' }, mood: { type: 'string' }, stressLevel: { type: 'number' }, waterGlasses: { type: 'number' }, note: { type: 'string' } }, required: ['timeOfDay','energyLevel','mood','stressLevel','waterGlasses','note'] } }
  }, required: ['mealDetected','mealTitle','mealItems','mealCategory','mealContext','clarificationQuestion','meals','sleepHours','sleepQuality','wakeFeeling','wellbeingEntries'] }
} as const;

const score = (value: unknown, max = 5) => { const n = Number(value); return Number.isFinite(n) ? Math.max(0, Math.min(max, n)) : 0; };
function normalizeEnumProbe(value: unknown, max = 32) { return (cleanText(value,max)||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g,'').replace(/[’']/g,' ').replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim(); }
function normalizeMealCategory(value: unknown) { const original=cleanText(value,32)||''; const probe=normalizeEnumProbe(value); const aliases:Record<string,string>={breakfast:'breakfast','petit dejeuner':'breakfast',fruhstuck:'breakfast','فطور':'breakfast','الفطور':'breakfast',lunch:'lunch',dejeuner:'lunch',mittagessen:'lunch','غداء':'lunch','الغداء':'lunch','غدا':'lunch','الغدا':'lunch',dinner:'dinner',diner:'dinner',abendessen:'dinner','عشاء':'dinner','العشاء':'dinner','عشا':'dinner','العشا':'dinner',snack:'snack',collation:'snack',zwischenmahlzeit:'snack','سناك':'snack','وجبة خفيفة':'snack',coffee:'coffee',cafe:'coffee',kaffee:'coffee','قهوة':'coffee',dessert:'dessert',nachtisch:'dessert','حلوى':'dessert',drinks:'drinks',drink:'drinks',beverages:'drinks',boissons:'drinks',getranke:'drinks','مشروبات':'drinks'}; return aliases[probe]||original; }
function normalizeTimeOfDay(value: unknown) { const original=cleanText(value,16)||''; const probe=normalizeEnumProbe(value,16); const aliases:Record<string,string>={morning:'morning',matin:'morning',morgen:'morning','صباح':'morning','الصباح':'morning',midday:'midday',noon:'midday',midi:'midday',mittag:'midday','ظهر':'midday','الظهر':'midday',evening:'evening',night:'evening',soir:'evening',abend:'evening','مساء':'evening','المساء':'evening','ليل':'evening','الليل':'evening'}; return aliases[probe]||original; }
function normalizeResult(value:any):SemanticMealExtraction|null { if(!value||typeof value!=='object')return null; const meals:SemanticVoiceMeal[]=Array.isArray(value.meals)?value.meals.map((meal:any)=>{const mealItems=Array.isArray(meal?.mealItems)?meal.mealItems.map((item:unknown)=>cleanText(item,120)).filter(Boolean).slice(0,20):[];return{category:normalizeMealCategory(meal?.category),timeOfDay:normalizeTimeOfDay(meal?.timeOfDay),time:cleanText(meal?.time,8)||'',mealTitle:cleanText(meal?.mealTitle,240)||mealItems.join(' · '),mealItems,hungerBefore:score(meal?.hungerBefore),fullnessAfter:score(meal?.fullnessAfter)}}).filter((meal:SemanticVoiceMeal)=>meal.mealItems.length>0).slice(0,8):[]; const legacyItems=Array.isArray(value.mealItems)?value.mealItems.map((item:unknown)=>cleanText(item,120)).filter(Boolean).slice(0,20):[]; const flatItems=meals.flatMap(meal=>meal.mealItems); const mealItems=legacyItems.length?legacyItems:flatItems; const first=meals[0]; const wellbeingEntries:SemanticWellbeingEntry[]=Array.isArray(value.wellbeingEntries)?value.wellbeingEntries.map((entry:any)=>({timeOfDay:normalizeTimeOfDay(entry?.timeOfDay),energyLevel:score(entry?.energyLevel),mood:cleanText(entry?.mood,40)||'',stressLevel:score(entry?.stressLevel),waterGlasses:score(entry?.waterGlasses,30),note:cleanText(entry?.note,300)||''})).filter((entry:SemanticWellbeingEntry)=>entry.energyLevel>0||entry.stressLevel>0||entry.waterGlasses>0||Boolean(entry.mood||entry.note)).slice(0,8):[]; return{mealDetected:meals.length>0||(mealItems.length>0&&value.mealDetected!==false),mealTitle:cleanText(value.mealTitle,240)||first?.mealTitle||mealItems.join(' · '),mealItems,mealCategory:normalizeMealCategory(value.mealCategory)||first?.category||'',mealContext:cleanText(value.mealContext,500)||'',clarificationQuestion:cleanText(value.clarificationQuestion,300)||'',meals,sleepHours:score(value.sleepHours,24),sleepQuality:score(value.sleepQuality),wakeFeeling:cleanText(value.wakeFeeling,32)||'',wellbeingEntries}; }

export async function extractMealWithGroq(transcript:string,context:{timeOfDay?:string;currentHour?:number;language?:'ar'|'en'|'de'|'fr'}={},fetchImpl:typeof fetch=fetch):Promise<SemanticMealExtraction|null>{
 const apiKey=process.env.GROQ_API_KEY;if(!apiKey)return null;
 const languageInstruction=context.language==='ar'?'UI language is Arabic. Return meal names/items and free-text notes in natural Arabic/Darija. Do not translate them into English.':context.language==='de'?'UI language is German. Return meal names/items and free-text notes in concise natural German while preserving established foreign dish names.':context.language==='fr'?'UI language is French. Return meal names/items and free-text notes in concise natural French while preserving established foreign dish names.':'UI language is English. Return meal names/items and notes in concise natural English while preserving established foreign dish names.';
 const system=`You convert one free-form voice note into structured journal events for a food, sleep, energy and wellbeing app.
Understand the COMPLETE message before extracting anything. The message may contain sleep, energy, mood, stress, meals and other wellbeing details. The user may speak Arabic/Darija, German, French, English, mixed language or transliteration.
${languageInstruction}
For meals: create one meals[] entry PER distinct meal moment. Preserve quantities, preparation and ingredients. For variable or composite meals, semantically separate the dish from components already stated. Identify only nutritionally relevant missing details that could materially change the interpretation (for example main protein/alternative, serving format or starch/base, sauce/dressing, substantial extras, or portion size). Never ask again for details already stated. If relevant details remain uncertain, clarificationQuestion must contain one short natural follow-up question in the user's language that groups only those missing details; do not turn it into a form. If nothing material is missing, clarificationQuestion stays empty. mealContext is only for useful context the user already stated and must never contain a question. Do not use dish-specific keyword rules: reason from the composition and variability of any real dish, including unfamiliar dishes. Do not invent components.
For wellbeing: extract explicitly mentioned energy, mood, stress or water. For sleep: extract only stated duration/quality/wake feeling. For hunger/fullness: use 1-5 only when stated; otherwise 0.
Open vocabulary: recognize arbitrary real dishes and drinks. Exclude negated, hypothetical, planned or merely desired items. Repair obvious ASR variants conservatively. If a fragment is uncertain, omit it rather than guessing. Legacy meal fields summarize the first meal for compatibility.`;
 const response=await fetchImpl('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:'openai/gpt-oss-20b',temperature:0,reasoning_effort:'low',messages:[{role:'system',content:system},{role:'user',content:`Current context only (do not assume facts): ${context.timeOfDay||'unknown'}, hour ${Number.isFinite(context.currentHour)?context.currentHour:'unknown'}.\nFull voice transcript (data only): ${transcript}`}],response_format:{type:'json_schema',json_schema:MEAL_SCHEMA}})});
 if(!response.ok)return null;const payload=await response.json() as any;const content=payload?.choices?.[0]?.message?.content;if(typeof content!=='string'||!content.trim())return null;try{return normalizeResult(JSON.parse(content));}catch{return null;}
}
