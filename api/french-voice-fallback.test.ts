import { afterEach, describe, expect, it } from 'vitest';
import handler from './voice-checkin';

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

describe('French voice fallback contractions', () => {
  it.each([
    ["j'ai mangé du pain mais pas d'oeufs", ['خبز']],
    ['j’ai mangé du pain mais pas d’œufs', ['خبز']],
  ])('keeps consumed food while excluding a contracted French negation: %s', async (transcript, expected) => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROQ_API_KEY;
    const response = createResponse();

    await handler({
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.71' },
      ip: '203.0.113.71',
      body: { transcript, timeOfDay: 'morning', currentHour: 9, language: 'en' },
    } as any, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body.extractedData.extractionEngine).toBe('deterministic-fallback');
    expect(response.body.extractedData.mealItems).toEqual(expected);
    expect(response.body.extractedData.mealItems).not.toContain('بيض');
  });

  it('still recognizes French food after a curly apostrophe contraction', async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROQ_API_KEY;
    const response = createResponse();

    await handler({
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.72' },
      ip: '203.0.113.72',
      body: { transcript: 'j’ai mangé deux œufs bouillis avec du pain', timeOfDay: 'morning', currentHour: 9, language: 'en' },
    } as any, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body.extractedData.mealItems).toEqual(expect.arrayContaining(['deux بيض مسلوق', 'خبز']));
  });
});
