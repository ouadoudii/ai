import { afterEach, describe, expect, it, vi } from 'vitest';
import { processVoiceCheckIn } from './apiClient';

afterEach(() => vi.unstubAllGlobals());

describe('voice check-in language', () => {
  it('sends Arabic UI language to the backend when selected', async () => {
    let body: any;
    vi.stubGlobal('fetch', vi.fn(async (_url: string, options?: RequestInit) => {
      body = JSON.parse(String(options?.body || '{}'));
      return { ok: true, json: async () => ({ coachFeedback: {}, extractedData: { mealItems: ['رفيسة'] } }) } as Response;
    }));

    await processVoiceCheckIn('j ai mangé rfissa', 'midday', undefined, 'ar');
    expect(body.language).toBe('ar');
  });

  it('keeps English UI language explicit', async () => {
    let body: any;
    vi.stubGlobal('fetch', vi.fn(async (_url: string, options?: RequestInit) => {
      body = JSON.parse(String(options?.body || '{}'));
      return { ok: true, json: async () => ({ coachFeedback: {}, extractedData: { mealItems: ['rfissa'] } }) } as Response;
    }));

    await processVoiceCheckIn('I ate rfissa', 'midday', undefined, 'en');
    expect(body.language).toBe('en');
  });
});
