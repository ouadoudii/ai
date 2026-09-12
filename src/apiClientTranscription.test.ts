import { afterEach, describe, expect, it, vi } from 'vitest';
import { transcribeRecordedAudio } from './apiClient';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('recorded audio transcription client', () => {
  it('sends the original audio blob, its content type and the selected voice language', async () => {
    const audio = new Blob(['voice-bytes'], { type: 'audio/webm;codecs=opus' });
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(init?.method).toBe('POST');
      expect(init?.body).toBe(audio);
      expect(init?.headers).toEqual({ 'Content-Type': 'audio/webm;codecs=opus', 'X-Voice-Language': 'ar' });
      expect(typeof init?.body).not.toBe('string');
      return new Response(JSON.stringify({ text: 'بيض مسلوق وقهوة' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(transcribeRecordedAudio(audio, 'ar')).resolves.toBe('بيض مسلوق وقهوة');
    expect(fetchMock).toHaveBeenCalledWith('/api/transcribe-audio', expect.any(Object));
  });

  it.each([
    ['en', 'coffee and toast'],
    ['de', 'Kaffee und Brot'],
    ['fr', 'café et tartine'],
  ] as const)('preserves %s as the voice-language hint for retry transcription', async (language, transcript) => {
    const audio = new Blob(['voice-bytes']);
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(init?.body).toBe(audio);
      expect(init?.headers).toEqual({ 'Content-Type': 'audio/webm', 'X-Voice-Language': language });
      return new Response(JSON.stringify({ text: transcript }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(transcribeRecordedAudio(audio, language)).resolves.toBe(transcript);
  });

  it('rejects an empty recording before making a network request', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(transcribeRecordedAudio(new Blob([], { type: 'audio/webm' }), 'de')).rejects.toThrow('Empty audio');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
