import { afterEach, describe, expect, it } from 'vitest';
import handler from './voice-checkin';

const originalGeminiKey = process.env.GEMINI_API_KEY;
afterEach(() => {
  if (originalGeminiKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalGeminiKey;
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

describe('voice check-in endpoint', () => {
  it('returns structured Darija meal items even when Gemini is unavailable', async () => {
    delete process.env.GEMINI_API_KEY;
    const response = createResponse();
    const req: any = {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.10' },
      ip: '203.0.113.10',
      body: {
        transcript: 'كليت جوج بيضات مسلوقين مع الخبز ومن بعد شربت قهوة بالحليب',
        timeOfDay: 'morning',
        currentHour: 8,
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

  it('recognizes the exact live transcript خبيزة بالفرماج when Gemini is unavailable', async () => {
    delete process.env.GEMINI_API_KEY;
    const response = createResponse();
    const req: any = {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.12' },
      ip: '203.0.113.12',
      body: {
        transcript: 'كليت خبيزة بالفرماج.',
        timeOfDay: 'morning',
        currentHour: 9,
      },
    };

    await handler(req, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body.extractedData.mealDetected).toBe(true);
    expect(response.body.extractedData.mealItems).toEqual(['خبز بالجبن']);
    expect(response.body.extractedData.mealTitle).toBe('خبز بالجبن');
  });

  it('keeps negated foods out of the endpoint response', async () => {
    delete process.env.GEMINI_API_KEY;
    const response = createResponse();
    const req: any = {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.11' },
      ip: '203.0.113.11',
      body: { transcript: 'كليت مسمن بالعسل ولكن ما شربتش قهوة' },
    };

    await handler(req, response.res);
    expect(response.body.extractedData.mealItems).toContain('مسمن بالعسل');
    expect(response.body.extractedData.mealItems).not.toContain('قهوة');
  });
});
