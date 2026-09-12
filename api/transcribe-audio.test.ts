import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from './transcribe-audio';

const originalGroqKey = process.env.GROQ_API_KEY;

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalGroqKey === undefined) delete process.env.GROQ_API_KEY;
  else process.env.GROQ_API_KEY = originalGroqKey;
});

function createResponse() {
  let statusCode = 200;
  let body: any;
  const headers = new Map<string, string>();
  const res: any = {
    setHeader(name: string, value: string) { headers.set(name.toLowerCase(), String(value)); return res; },
    status(code: number) { statusCode = code; return res; },
    json(value: any) { body = value; return res; },
  };
  return { res, get statusCode() { return statusCode; }, get body() { return body; }, headers };
}

function upstream(text: string, language: string, ok = true) {
  return { ok, status: ok ? 200 : 500, json: async () => ({ text, language }) } as Response;
}

describe('server audio transcription', () => {
  it('retries Arabic when Darija auto-detection loses Arabic script and keeps the recovered transcript', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    const seenLanguages: Array<string | null> = [];
    vi.stubGlobal('fetch', vi.fn(async (_url: string, options?: RequestInit) => {
      const form = options?.body as FormData;
      seenLanguages.push(form.get('language')?.toString() || null);
      if (seenLanguages.length === 1) return upstream('klit juj baydat msloqin m3a khobz', 'French');
      return upstream('كليت جوج بيضات مسلوقين مع الخبز', 'Arabic');
    }));

    const response = createResponse();
    await handler({
      method: 'POST',
      headers: { 'content-type': 'audio/webm', 'x-voice-language': 'ar' },
      body: Buffer.from('fake-audio'),
    } as any, response.res);

    expect(response.statusCode).toBe(200);
    expect(seenLanguages).toEqual([null, 'ar']);
    expect(response.body).toMatchObject({
      text: 'كليت جوج بيضات مسلوقين مع الخبز',
      engine: 'whisper-large-v3-ar-recovery',
      detectedLanguage: 'Arabic',
    });
  });

  it('uses a stronger script-preserving prompt only for the Arabic recovery pass', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    const seenPrompts: string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (_url: string, options?: RequestInit) => {
      const form = options?.body as FormData;
      seenPrompts.push(String(form.get('prompt') || ''));
      if (seenPrompts.length === 1) return upstream('klit 3dess w 7lib w 9ahwa', 'French');
      return upstream('كليت عدس وحليب وقهوة', 'Arabic');
    }));

    const response = createResponse();
    await handler({
      method: 'POST',
      headers: { 'content-type': 'audio/webm', 'x-voice-language': 'ar' },
      body: Buffer.from('fake-audio'),
    } as any, response.res);

    expect(response.statusCode).toBe(200);
    expect(seenPrompts).toHaveLength(2);
    expect(seenPrompts[0]).not.toContain('هذه محاولة استرجاع عربية');
    expect(seenPrompts[1]).toContain('هذه محاولة استرجاع عربية');
    expect(seenPrompts[1]).toContain('3dess');
    expect(seenPrompts[1]).toContain('7lib');
    expect(seenPrompts[1]).toContain('9ahwa');
    expect(seenPrompts[1]).toContain('احتفظ فقط بالكلمات الفرنسية أو الإنجليزية الحقيقية بلغتها الأصلية');
    expect(response.body.text).toBe('كليت عدس وحليب وقهوة');
  });

  it('keeps a genuine Latin-script auto transcript if the Arabic recovery pass does not restore Arabic', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(upstream('j ai mangé un tajine avec du pain', 'French'))
      .mockResolvedValueOnce(upstream('j ai mangé un tajine avec du pain', 'Arabic')));

    const response = createResponse();
    await handler({
      method: 'POST',
      headers: { 'content-type': 'audio/webm', 'x-voice-language': 'ar' },
      body: Buffer.from('fake-audio'),
    } as any, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      text: 'j ai mangé un tajine avec du pain',
      engine: 'whisper-large-v3-auto',
      detectedLanguage: 'French',
    });
  });

  it('does not add a recovery call for non-Arabic voice sessions', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    const fetchMock = vi.fn(async () => upstream('Zum Frühstück hatte ich Brot und Kaffee', 'German'));
    vi.stubGlobal('fetch', fetchMock);

    const response = createResponse();
    await handler({
      method: 'POST',
      headers: { 'content-type': 'audio/webm', 'x-voice-language': 'de' },
      body: Buffer.from('fake-audio'),
    } as any, response.res);

    expect(response.statusCode).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(response.body.engine).toBe('whisper-large-v3-auto');
  });

  it('falls back to the usable auto transcript if the Arabic recovery request fails', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(upstream('klit msemen w atay', 'French'))
      .mockResolvedValueOnce(upstream('', 'Arabic', false)));

    const response = createResponse();
    await handler({
      method: 'POST',
      headers: { 'content-type': 'audio/webm', 'x-voice-language': 'ar' },
      body: Buffer.from('fake-audio'),
    } as any, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({ text: 'klit msemen w atay', engine: 'whisper-large-v3-auto' });
  });
});
