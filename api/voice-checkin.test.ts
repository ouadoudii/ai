import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from './voice-checkin';

const originalGeminiKey = process.env.GEMINI_API_KEY;
const originalGroqKey = process.env.GROQ_API_KEY;
afterEach(() => {
  vi.unstubAllGlobals();
  if (originalGeminiKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalGeminiKey;
  if (originalGroqKey === undefined) delete process.env.GROQ_API_KEY;
  else process.env.GROQ_API_KEY = originalGroqKey;
});

function createResponse() {
  const headers = new Map<string, string>();
  let statusCode = 200;
  let body: any;
  const res: any = {
    setHeader(name: string, value: string) { headers.set(name.toLowerCase(), String(value)); return res; },
    status(code: number) { statusCode = code; return res; },
    json(value: any) { body = value; return res; },
  };
  return { res, get statusCode() { return statusCode; }, get body() { return body; }, headers };
}

function groqResponse(extracted: any) {
  return {
    ok: true,
    json: async () => ({ choices: [{ message: { content: JSON.stringify(extracted) } }] }),
  } as Response;
}

describe('voice check-in endpoint', () => {
  it('uses semantic AI for a new dish that is absent from the static dictionary and passes Arabic UI language', async () => {
    delete process.env.GEMINI_API_KEY;
    process.env.GROQ_API_KEY = 'test-key';
    let requestBody = '';
    const fetchMock = vi.fn(async (_url: string, options?: RequestInit) => {
      requestBody = String(options?.body || '');
      return groqResponse({
        mealDetected: true,
        mealTitle: 'رفيسة بالدجاج والزبيب',
        mealItems: ['رفيسة بالدجاج والزبيب'],
        mealCategory: 'lunch',
        mealContext: '',
      });
    });
    vi.stubGlobal('fetch', fetchMock);
    const response = createResponse();
    const req: any = {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.20' },
      ip: '203.0.113.20',
      body: { transcript: 'كليت رفيسة بالدجاج والزبيب', timeOfDay: 'midday', currentHour: 13, language: 'ar' },
    };

    await handler(req, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body.extractedData.extractionEngine).toBe('groq-semantic');
    expect(response.body.extractedData.mealItems).toEqual(['رفيسة بالدجاج والزبيب']);
    const body = JSON.parse(requestBody);
    expect(body.messages[0].content).toContain('UI language is Arabic');
  });

  it('keeps deterministic extraction only as fallback when semantic providers are unavailable', async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROQ_API_KEY;
    const response = createResponse();
    const req: any = {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.10' },
      ip: '203.0.113.10',
      body: {
        transcript: 'كليت جوج بيضات مسلوقين مع الخبز ومن بعد شربت قهوة بالحليب',
        timeOfDay: 'morning',
        currentHour: 8,
        language: 'ar',
      },
    };

    await handler(req, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body.extractedData.extractionEngine).toBe('deterministic-fallback');
    expect(response.body.extractedData.mealDetected).toBe(true);
    expect(response.body.extractedData.mealItems).toEqual(expect.arrayContaining([
      'جوج بيض مسلوق', 'خبز', 'قهوة بالحليب',
    ]));
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('recognizes the exact live transcript خبيزة بالفرماج in fallback mode', async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROQ_API_KEY;
    const response = createResponse();
    const req: any = {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.12' },
      ip: '203.0.113.12',
      body: {
        transcript: 'كليت خبيزة بالفرماج.',
        timeOfDay: 'morning',
        currentHour: 9,
        language: 'ar',
      },
    };

    await handler(req, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body.extractedData.mealDetected).toBe(true);
    expect(response.body.extractedData.mealItems).toEqual(['خبز بالجبن']);
    expect(response.body.extractedData.mealTitle).toBe('خبز بالجبن');
  });

  it('keeps negated foods out of the fallback response', async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROQ_API_KEY;
    const response = createResponse();
    const req: any = {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.11' },
      ip: '203.0.113.11',
      body: { transcript: 'كليت مسمن بالعسل ولكن ما شربتش قهوة', language: 'ar' },
    };

    await handler(req, response.res);
    expect(response.body.extractedData.mealItems).toContain('مسمن بالعسل');
    expect(response.body.extractedData.mealItems).not.toContain('قهوة');
  });
});
