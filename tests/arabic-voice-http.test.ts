import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import express from 'express';
import { createServer, type Server } from 'node:http';
import { once } from 'node:events';
import voiceCheckin from '../api/voice-checkin';

describe('Arabic voice check-in over real HTTP without AI credentials', () => {
  let server: Server;
  let baseURL: string;
  const originalGemini = process.env.GEMINI_API_KEY;
  const originalGroq = process.env.GROQ_API_KEY;

  beforeAll(async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROQ_API_KEY;
    const app = express();
    app.use(express.json({ limit: '256kb', strict: true }));
    app.all('/api/voice-checkin', voiceCheckin);
    server = createServer(app).listen(0, '127.0.0.1');
    await once(server, 'listening');
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing HTTP address');
    baseURL = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    if (originalGemini === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalGemini;
    if (originalGroq === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = originalGroq;
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  });

  it('extracts an Arabic sentence and returns Arabic feedback through the production handler', async () => {
    const transcript = 'أكلت كسكس وشربت أتاي';
    const response = await fetch(`${baseURL}/api/voice-checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, language: 'ar', currentHour: 12 }),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    const result = await response.json();
    expect(result.extractedData).toMatchObject({ mealDetected: true, extractionEngine: 'deterministic-fallback', mealContext: transcript });
    expect(result.extractedData.mealItems).toEqual(expect.arrayContaining(['كسكس', 'أتاي']));
    expect(result.coachFeedback.message).toMatch(/[\u0600-\u06ff]/);
  });

  it('rejects an empty transcript at the HTTP boundary', async () => {
    const response = await fetch(`${baseURL}/api/voice-checkin`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript: '  ', language: 'ar' }),
    });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: 'Invalid transcript' });
  });

  it('rejects unsupported methods instead of returning an HTML app shell', async () => {
    const response = await fetch(`${baseURL}/api/voice-checkin`);
    expect(response.status).toBe(405);
    expect(await response.json()).toMatchObject({ error: 'Method not allowed' });
  });
});
