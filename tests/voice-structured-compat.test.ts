import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from '../api/voice-checkin';

const originalGeminiKey = process.env.GEMINI_API_KEY;
const originalGroqKey = process.env.GROQ_API_KEY;

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalGeminiKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalGeminiKey;
  if (originalGroqKey === undefined) delete process.env.GROQ_API_KEY;
  else process.env.GROQ_API_KEY = originalGroqKey;
});

function responseHarness() {
  let statusCode = 200;
  let body: any;
  const res: any = {
    setHeader() { return res; },
    status(code: number) { statusCode = code; return res; },
    json(value: any) { body = value; return res; },
  };
  return { res, get statusCode() { return statusCode; }, get body() { return body; } };
}

describe('structured voice compatibility', () => {
  it('derives legacy top-level meal fields from the first structured meal', async () => {
    delete process.env.GEMINI_API_KEY;
    process.env.GROQ_API_KEY = 'test-key';
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ choices: [{ message: { content: JSON.stringify({
        mealDetected: true,
        mealTitle: '',
        mealItems: [],
        mealCategory: '',
        mealContext: '',
        meals: [{
          category: 'lunch',
          timeOfDay: 'midday',
          time: '13:00',
          mealTitle: 'رفيسة بالدجاج والزبيب',
          mealItems: ['رفيسة بالدجاج والزبيب'],
          hungerBefore: 4,
          fullnessAfter: 5,
        }],
        sleepHours: 0,
        sleepQuality: 0,
        wakeFeeling: '',
        wellbeingEntries: [],
      }) } }] }),
    } as Response)));

    const response = responseHarness();
    await handler({
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.77' },
      ip: '203.0.113.77',
      body: { transcript: 'فالغدا كليت رفيسة بالدجاج والزبيب', timeOfDay: 'midday', currentHour: 13, language: 'ar' },
    } as any, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body.extractedData.extractionEngine).toBe('groq-semantic');
    expect(response.body.extractedData.mealItems).toEqual(['رفيسة بالدجاج والزبيب']);
    expect(response.body.extractedData.mealTitle).toBe('رفيسة بالدجاج والزبيب');
    expect(response.body.extractedData.mealCategory).toBe('lunch');
    expect(response.body.extractedData.meals).toHaveLength(1);
  });
});
