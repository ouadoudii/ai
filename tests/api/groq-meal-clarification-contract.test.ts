import { afterEach, describe, expect, it, vi } from 'vitest';
import { extractMealWithGroq } from '../../api/groq-meal-extractor';

const originalGroqKey = process.env.GROQ_API_KEY;
afterEach(() => {
  vi.restoreAllMocks();
  if (originalGroqKey === undefined) delete process.env.GROQ_API_KEY;
  else process.env.GROQ_API_KEY = originalGroqKey;
});

const providerResult = {
  mealDetected: true,
  mealTitle: 'Döner mit Hähnchen und Knoblauchsauce',
  mealItems: ['Döner', 'Hähnchen', 'Knoblauchsauce'],
  mealCategory: 'lunch',
  mealContext: '',
  clarificationQuestion: 'War der Döner im Brot oder als Teller, und wie groß war die Portion?',
  meals: [{ category: 'lunch', timeOfDay: 'midday', time: '', mealTitle: 'Döner mit Hähnchen und Knoblauchsauce', mealItems: ['Döner', 'Hähnchen', 'Knoblauchsauce'], hungerBefore: 0, fullnessAfter: 0 }],
  sleepHours: 0, sleepQuality: 0, wakeFeeling: '', wellbeingEntries: [],
};

describe('semantic variable-meal clarification contract', () => {
  it.each([
    ['de', 'Döner mit Hähnchen und Knoblauchsauce'],
    ['fr', 'pizza avec mozzarella et olives'],
    ['en', 'a chicken bowl with rice and tahini'],
    ['ar', 'كليت طاجين بالدجاج والزيتون'],
    ['ar', 'klt couscous b khodra, portion kbira'],
  ] as const)('asks only for nutritionally relevant missing details without dish-specific keyword rules (%s)', async (language, transcript) => {
    process.env.GROQ_API_KEY = 'test-key';
    let requestBody = '';
    const fetchMock = vi.fn(async (_url: string, options?: RequestInit) => {
      requestBody = String(options?.body || '');
      return { ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify(providerResult) } }] }) } as Response;
    });

    await extractMealWithGroq(transcript, { language }, fetchMock as any);
    const prompt = JSON.parse(requestBody).messages[0].content as string;

    expect(prompt).toContain('variable or composite meals');
    expect(prompt).toContain('already stated');
    expect(prompt).toContain('nutritionally relevant missing');
    expect(prompt).toContain('one short natural follow-up');
    expect(prompt).toContain('Do not use dish-specific keyword rules');
  });

  it('keeps known components and returns the provider question separately from meal context', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ choices: [{ message: { content: JSON.stringify(providerResult) } }] }),
    }) as Response);

    const result = await extractMealWithGroq('Döner mit Hähnchen und Knoblauchsauce', { language: 'de' }, fetchMock as any);

    expect(result?.mealItems).toEqual(['Döner', 'Hähnchen', 'Knoblauchsauce']);
    expect(result?.clarificationQuestion).toBe('War der Döner im Brot oder als Teller, und wie groß war die Portion?');
    expect(result?.mealContext).toBe('');
  });
});
