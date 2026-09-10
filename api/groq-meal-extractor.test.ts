import { afterEach, describe, expect, it, vi } from 'vitest';
import { extractMealWithGroq } from './groq-meal-extractor';

const originalGroqKey = process.env.GROQ_API_KEY;
afterEach(() => {
  vi.restoreAllMocks();
  if (originalGroqKey === undefined) delete process.env.GROQ_API_KEY;
  else process.env.GROQ_API_KEY = originalGroqKey;
});

function responseWith(result: unknown, ok = true) {
  return {
    ok,
    json: async () => ({ choices: [{ message: { content: JSON.stringify(result) } }] }),
  } as Response;
}

describe('Groq semantic meal extraction', () => {
  it('accepts a completely unseen regional dish without a static dictionary entry', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    let requestBody = '';
    const fetchMock = vi.fn(async (_url: string, options?: RequestInit) => {
      requestBody = String(options?.body || '');
      return responseWith({
        mealDetected: true,
        mealTitle: 'رفيسة بالدجاج والزبيب',
        mealItems: ['رفيسة بالدجاج والزبيب'],
        mealCategory: 'lunch',
        mealContext: '',
      });
    });

    const result = await extractMealWithGroq('كليت رفيسة بالدجاج والزبيب', { timeOfDay: 'midday', currentHour: 13 }, fetchMock as any);
    expect(result?.mealItems).toEqual(['رفيسة بالدجاج والزبيب']);
    const body = JSON.parse(requestBody);
    expect(body.model).toBe('openai/gpt-oss-20b');
    expect(body.response_format.type).toBe('json_schema');
    expect(body.response_format.json_schema.strict).toBe(true);
  });

  it('supports several arbitrary foods from mixed dialect/languages', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    const fetchMock = vi.fn(async () => responseWith({
      mealDetected: true,
      mealTitle: 'مقلوبة · labneh · café au lait',
      mealItems: ['مقلوبة بالدجاج', 'لبنة', 'café au lait'],
      mealCategory: 'dinner',
      mealContext: '',
    }));
    const result = await extractMealWithGroq('تعشيت مقلوبة بالدجاج ومعاها labneh وشربت café au lait', {}, fetchMock as any);
    expect(result?.mealItems).toEqual(['مقلوبة بالدجاج', 'لبنة', 'café au lait']);
  });

  it('preserves semantic negation from the model output', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    const fetchMock = vi.fn(async () => responseWith({
      mealDetected: true,
      mealTitle: 'بيصارة',
      mealItems: ['بيصارة'],
      mealCategory: '',
      mealContext: '',
    }));
    const result = await extractMealWithGroq('كليت بيصارة ولكن ما كليتش معقودة', {}, fetchMock as any);
    expect(result?.mealItems).toEqual(['بيصارة']);
  });

  it('returns null on provider failure so the endpoint can recover', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    const fetchMock = vi.fn(async () => responseWith({}, false));
    await expect(extractMealWithGroq('أي وجبة', {}, fetchMock as any)).resolves.toBeNull();
  });

  it('does not call the provider when the Groq key is unavailable', async () => {
    delete process.env.GROQ_API_KEY;
    const fetchMock = vi.fn();
    await expect(extractMealWithGroq('كليت حاجة', {}, fetchMock as any)).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
