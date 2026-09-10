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
  context: { timeOfDay?: string; currentHour?: number } = {},
  fetchImpl: typeof fetch = fetch,
): Promise<SemanticMealExtraction | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const system = `You extract foods and drinks from natural speech for a food journal.
Understand meaning, not a dictionary. The user may speak Moroccan, Algerian, Tunisian, Libyan, Egyptian, Sudanese, Levantine, Iraqi, Gulf, Yemeni or Modern Standard Arabic, and may mix Arabic with Darija, French, English or transliteration.
Recognize arbitrary real dishes and ingredients even if they are rare, regional, homemade, misspelled or absent from any predefined list. Examples include rfissa/رفيسة, mrouzia/مروزية, maakouda/معقودة, bissara/بيصارة, koshari/كشري, molokhia/ملوخية, mansaf/منسف, maqluba/مقلوبة, kabsa/كبسة and completely unseen dishes.
Use the full sentence to repair obvious ASR spelling variants conservatively. Preserve useful quantity, preparation and ingredient details. If several consumed foods/drinks are mentioned, return each as a separate item. If several meal moments are mentioned, include all of them. Exclude anything explicitly negated or merely planned/wanted rather than consumed. Never invent a food that the transcript does not support.
Return concise meal items in the script/language that best matches the transcript. mealCategory may be breakfast, lunch, dinner, snack, coffee, dessert, or empty if unclear. mealContext should contain only useful non-food context, otherwise empty.`;

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
