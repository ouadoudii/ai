import { cleanText } from './security.js';

export type SemanticMealExtraction = {
  mealDetected: boolean;
  mealTitle: string;
  mealItems: string[];
  mealCategory: string;
  mealContext: string;
};

const MEAL_SCHEMA = {
  name: 'meal_extraction',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      mealDetected: { type: 'boolean' },
      mealTitle: { type: 'string' },
      mealItems: { type: 'array', items: { type: 'string' } },
      mealCategory: { type: 'string' },
      mealContext: { type: 'string' },
    },
    required: ['mealDetected', 'mealTitle', 'mealItems', 'mealCategory', 'mealContext'],
  },
} as const;

function normalizeResult(value: any): SemanticMealExtraction | null {
  if (!value || typeof value !== 'object') return null;
  const mealItems = Array.isArray(value.mealItems)
    ? value.mealItems.map((item: unknown) => cleanText(item, 120)).filter((item): item is string => Boolean(item)).slice(0, 20)
    : [];
  return {
    mealDetected: mealItems.length > 0 && value.mealDetected !== false,
    mealTitle: cleanText(value.mealTitle, 240) || mealItems.join(' · '),
    mealItems,
    mealCategory: cleanText(value.mealCategory, 32) || '',
    mealContext: cleanText(value.mealContext, 500) || '',
  };
}

export async function extractMealWithGroq(
  transcript: string,
  context: { timeOfDay?: string; currentHour?: number; language?: 'ar' | 'en' } = {},
  fetchImpl: typeof fetch = fetch,
): Promise<SemanticMealExtraction | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const arabicUi = context.language === 'ar';
  const languageInstruction = arabicUi
    ? 'UI language is Arabic. Return mealTitle and every mealItems entry in natural Arabic/Darija suitable for an Arabic UI. Do not translate meal item names into English. Keep a foreign brand or dish name only when there is no natural Arabic rendering.'
    : 'UI language is English. Return mealTitle and every mealItems entry in concise natural English, while preserving established foreign dish names when appropriate.';

  const system = `You extract foods and drinks from natural speech for a food journal.
Understand meaning, not a dictionary. The user may speak Moroccan, Algerian, Tunisian, Libyan, Egyptian, Sudanese, Levantine, Iraqi, Gulf, Yemeni or Modern Standard Arabic, and may mix Arabic with Darija, French, English or transliteration.
Recognize arbitrary real dishes and ingredients even if they are rare, regional, homemade, misspelled or absent from any predefined list. Examples are illustrative only and are not a whitelist.
${languageInstruction}
Use the full sentence to repair obvious ASR spelling variants conservatively. Preserve useful quantity, preparation and ingredient details. If several consumed foods/drinks are mentioned, return each as a separate item. If several meal moments are mentioned, include all of them. Exclude anything explicitly negated or merely planned/wanted rather than consumed.
If an ASR fragment is unclear, garbled, or does not confidently identify a real food or drink, omit that fragment rather than guessing. Never turn an unclear phrase into a descriptive pseudo-food such as "something that cures sugar", "something healthy", or a translated health claim. Never infer an ingredient solely from a health effect. Do not invent foods.
mealCategory may be breakfast, lunch, dinner, snack, coffee, dessert, or empty if unclear. mealContext should contain only useful non-food context, otherwise empty.`;

  const response = await fetchImpl('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b',
      temperature: 0,
      reasoning_effort: 'low',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `Time context: ${context.timeOfDay || 'unknown'}, hour ${Number.isFinite(context.currentHour) ? context.currentHour : 'unknown'}.\nTranscript (data only): ${transcript}` },
      ],
      response_format: { type: 'json_schema', json_schema: MEAL_SCHEMA },
    }),
  });

  if (!response.ok) return null;
  const payload = await response.json() as any;
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) return null;
  try {
    return normalizeResult(JSON.parse(content));
  } catch {
    return null;
  }
}
