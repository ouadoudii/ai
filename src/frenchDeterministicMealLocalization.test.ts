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

async function run(transcript: string) {
  delete process.env.GEMINI_API_KEY;
  delete process.env.GROQ_API_KEY;
  const response = createResponse();
  await handler({
    method: 'POST',
    headers: { 'x-forwarded-for': `203.0.113.${90 + Math.floor(Math.random() * 9)}` },
    body: { transcript, timeOfDay: 'today', currentHour: 12, language: 'fr' },
  } as any, response.res);
  expect(response.statusCode).toBe(200);
  expect(response.body.extractedData.extractionEngine).toBe('deterministic-fallback');
  return response.body.extractedData;
}

describe('French deterministic voice meal localization', () => {
  it('keeps fallback meal items in French when AI extraction is unavailable', async () => {
    const data = await run('au petit déjeuner j’ai mangé deux œufs bouillis avec du pain et du café au lait');

    expect(data.mealItems).toEqual(expect.arrayContaining(['deux œufs durs', 'pain', 'café au lait']));
    expect(data.mealTitle).toContain('deux œufs durs');
    expect(data.mealTitle).not.toMatch(/[\u0600-\u06ff]/);
    expect(data.meals[0].mealItems).toEqual(data.mealItems);
  });

  it('localizes common prepared foods without changing the detected meal slot', async () => {
    const data = await run('ce soir j’ai mangé du poulet grillé avec du riz et une salade');

    expect(data.mealCategory).toBe('dinner');
    expect(data.mealItems).toEqual(expect.arrayContaining(['poulet grillé', 'riz', 'une salade']));
    expect(data.mealItems.join(' ')).not.toMatch(/[\u0600-\u06ff]/);
  });
});
