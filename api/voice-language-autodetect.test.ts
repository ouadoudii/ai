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

async function run(transcript: string, ip: string, language?: string) {
  delete process.env.GEMINI_API_KEY;
  delete process.env.GROQ_API_KEY;
  const response = createResponse();
  await handler({
    method: 'POST',
    headers: { 'x-forwarded-for': ip },
    ip,
    body: { transcript, timeOfDay: 'today', currentHour: 12, ...(language ? { language } : {}) },
  } as any, response.res);
  expect(response.statusCode).toBe(200);
  return response.body;
}

describe('voice language auto-detection', () => {
  it('returns German feedback when a German transcript arrives without a language field', async () => {
    const body = await run('Heute Morgen habe ich zum Frühstück Brot gegessen und Kaffee getrunken.', '203.0.113.80');
    expect(body.coachFeedback.badge).toBe('Sprach-Check-in');
    expect(body.coachFeedback.title).toMatch(/Sprachnotiz|Cary ist bei dir/);
  });

  it('returns French feedback when a French transcript arrives without a language field', async () => {
    const body = await run("Ce matin j’ai mangé du pain avec du fromage au petit-déjeuner.", '203.0.113.81');
    expect(body.coachFeedback.badge).toBe('Check-in vocal');
    expect(body.coachFeedback.title).toMatch(/Note vocale|Cary est avec toi/);
  });

  it('keeps English as the safe default for an English transcript', async () => {
    const body = await run('This morning I had toast and coffee for breakfast.', '203.0.113.82');
    expect(body.coachFeedback.badge).toBe('Voice check-in');
    expect(body.coachFeedback.title).toMatch(/Voice journal|Cary is with you/);
  });

  it('respects an explicit UI language instead of overriding it from transcript heuristics', async () => {
    const body = await run("Ce matin j’ai mangé du pain avec du fromage.", '203.0.113.83', 'en');
    expect(body.coachFeedback.badge).toBe('Voice check-in');
  });
});
