import { afterEach, describe, expect, it } from 'vitest';
import handler from '../api/voice-checkin';

const originalGeminiKey = process.env.GEMINI_API_KEY;
const originalGroqKey = process.env.GROQ_API_KEY;

afterEach(() => {
  if (originalGeminiKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalGeminiKey;
  if (originalGroqKey === undefined) delete process.env.GROQ_API_KEY;
  else process.env.GROQ_API_KEY = originalGroqKey;
});

function createResponse() {
  let statusCode = 200;
  let body: any;
  const res: any = {
    setHeader() { return res; },
    status(code: number) { statusCode = code; return res; },
    json(value: any) { body = value; return res; },
  };
  return { res, get statusCode() { return statusCode; }, get body() { return body; } };
}

describe('English deterministic voice fallback', () => {
  it('keeps fallback meal names in English when AI providers are unavailable', async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROQ_API_KEY;
    const response = createResponse();

    await handler({
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.61' },
      ip: '203.0.113.61',
      body: {
        transcript: 'This morning I had two boiled eggs, bread with cheese and coffee with milk',
        timeOfDay: 'morning',
        currentHour: 8,
        language: 'en',
      },
    } as any, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body.extractedData.extractionEngine).toBe('deterministic-fallback');
    expect(response.body.extractedData.mealItems).toEqual(expect.arrayContaining([
      'two boiled eggs',
      'bread with cheese',
      'coffee with milk',
    ]));
    expect(response.body.extractedData.mealTitle).not.toMatch(/[\u0600-\u06FF]/);
    expect(response.body.coachFeedback.badge).toBe('Voice check-in');
  });
});
