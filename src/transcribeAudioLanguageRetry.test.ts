import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '../api/transcribe-audio';

function createResponse() {
  let statusCode = 200;
  let body: any;
  const headers = new Map<string, string>();
  const res = {
    setHeader(name: string, value: string) { headers.set(name, value); return res; },
    status(code: number) { statusCode = code; return res; },
    json(value: any) { body = value; return res; },
  };
  return { res: res as any, get statusCode() { return statusCode; }, get body() { return body; } };
}

const originalGroqKey = process.env.GROQ_API_KEY;

beforeEach(() => {
  process.env.GROQ_API_KEY = 'test-key';
});

afterEach(() => {
  vi.restoreAllMocks();
  if (originalGroqKey === undefined) delete process.env.GROQ_API_KEY;
  else process.env.GROQ_API_KEY = originalGroqKey;
});

describe('transcription language retry', () => {
  it.each([
    ['de', 'Kaffee und Brot', 'whisper-large-v3-de-retry'],
    ['fr', 'café et tartine', 'whisper-large-v3-fr-retry'],
    ['en', 'coffee and toast', 'whisper-large-v3-en-retry'],
    ['ar', 'بيض وقهوة', 'whisper-large-v3-ar-retry'],
  ] as const)('retries failed auto-detection in the selected %s language', async (language, transcript, engine) => {
    const seenLanguages: Array<FormDataEntryValue | null> = [];
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const form = init?.body as FormData;
      seenLanguages.push(form.get('language'));
      if (seenLanguages.length === 1) return new Response('upstream failed', { status: 500 });
      return new Response(JSON.stringify({ text: transcript, language }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetchMock);
    const response = createResponse();

    await handler({
      method: 'POST',
      headers: { 'content-type': 'audio/webm', 'x-voice-language': language },
      body: Buffer.from('recorded-audio'),
    } as any, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({ text: transcript, engine, detectedLanguage: language });
    expect(seenLanguages).toEqual([null, language]);
  });

  it('keeps auto-detection language-neutral on the successful first attempt', async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const form = init?.body as FormData;
      expect(form.get('language')).toBeNull();
      return new Response(JSON.stringify({ text: 'bonjour et سلام', language: 'fr' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetchMock);
    const response = createResponse();

    await handler({
      method: 'POST',
      headers: { 'content-type': 'audio/webm', 'x-voice-language': 'fr' },
      body: Buffer.from('recorded-audio'),
    } as any, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body.engine).toBe('whisper-large-v3-auto');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
