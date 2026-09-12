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

describe('French voice fallback contractions', () => {
  it.each([
    ["j'ai mangé du pain mais pas d'oeufs", ['bread']],
    ['j’ai mangé du pain mais pas d’œufs', ['bread']],
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
    expect(response.body.extractedData.mealItems.join(' ')).not.toMatch(/[\u0600-\u06FF]/);
    expect(response.body.extractedData.mealItems).not.toContain('eggs');
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
    expect(response.body.extractedData.mealItems).toEqual(expect.arrayContaining(['deux boiled eggs', 'bread']));
    expect(response.body.extractedData.mealItems.join(' ')).not.toMatch(/[\u0600-\u06FF]/);
  });

  it.each([
    ['au petit-déjeuner j’ai mangé deux œufs avec du pain', 'breakfast', ['deux eggs', 'bread']],
    ['l’après-midi j’ai mangé une pomme', 'snack', ['une apple']],
    ['cet après‑midi j’ai mangé une banane', 'snack', ['une banana']],
  ])('understands hyphenated French meal-time speech: %s', async (transcript, expectedCategory, expectedItems) => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROQ_API_KEY;
    const response = createResponse();

    await handler({
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.73' },
      ip: '203.0.113.73',
      body: { transcript, timeOfDay: 'today', currentHour: 12, language: 'en' },
    } as any, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body.extractedData.extractionEngine).toBe('deterministic-fallback');
    expect(response.body.extractedData.mealCategory).toBe(expectedCategory);
    expect(response.body.extractedData.mealItems).toEqual(expect.arrayContaining(expectedItems));
    expect(response.body.extractedData.mealItems.join(' ')).not.toMatch(/[\u0600-\u06FF]/);
  });

  it('returns French coach feedback when the voice language is French', async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROQ_API_KEY;
    const response = createResponse();

    await handler({
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.74' },
      ip: '203.0.113.74',
      body: { transcript: 'au petit-déjeuner j’ai mangé une banane', timeOfDay: 'morning', currentHour: 9, language: 'fr' },
    } as any, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body.extractedData.extractionEngine).toBe('deterministic-fallback');
    expect(response.body.extractedData.mealCategory).toBe('breakfast');
    expect(response.body.coachFeedback).toMatchObject({
      title: 'Note vocale enregistrée 💚',
      message: 'J’ai compris ta note et classé les repas et le bien-être au bon endroit.',
      badge: 'Check-in vocal',
    });
  });

  it('keeps French feedback for a valid note that contains no recognized meal', async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROQ_API_KEY;
    const response = createResponse();

    await handler({
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.75' },
      ip: '203.0.113.75',
      body: { transcript: 'je me sens bien aujourd’hui', timeOfDay: 'today', currentHour: 15, language: 'fr' },
    } as any, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body.coachFeedback).toMatchObject({
      title: 'Cary est avec toi 💚',
      message: 'J’ai enregistré ta note vocale.',
      badge: 'Check-in vocal',
    });
  });
});