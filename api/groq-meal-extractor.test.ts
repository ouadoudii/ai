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

    const result = await extractMealWithGroq('كليت رفيسة بالدجاج والزبيب', { timeOfDay: 'midday', currentHour: 13, language: 'ar' }, fetchMock as any);
    expect(result?.mealItems).toEqual(['رفيسة بالدجاج والزبيب']);
    const body = JSON.parse(requestBody);
    expect(body.model).toBe('openai/gpt-oss-20b');
    expect(body.response_format.type).toBe('json_schema');
    expect(body.response_format.json_schema.strict).toBe(true);
    expect(body.messages[0].content).toContain('UI language is Arabic');
    expect(body.messages[0].content).toContain('Do not translate meal item names into English');
  });

  it('tells the model to omit uncertain ASR fragments instead of inventing descriptive foods', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    let requestBody = '';
    const fetchMock = vi.fn(async (_url: string, options?: RequestInit) => {
      requestBody = String(options?.body || '');
      return responseWith({
        mealDetected: true,
        mealTitle: 'بيض مسلوق · خبز · كرواسون · خضرة',
        mealItems: ['بيضتان مسلوقتان', 'خبز', 'كرواسون', 'خضرة'],
        mealCategory: 'lunch',
        mealContext: '',
      });
    });

    await extractMealWithGroq('وكلت فيها واحد جوج بيضات مسلوقين وكلت واحد الخبيزة وشربت واحد الكاس ديالته بشفيه السكر بلاك ومن ثم كلت واحد كروسون وبقيت شوية تل الغداء كلت الخضرة', { language: 'ar' }, fetchMock as any);
    const body = JSON.parse(requestBody);
    expect(body.messages[0].content).toContain('If an ASR fragment is unclear');
    expect(body.messages[0].content).toContain('Never turn an unclear phrase into a descriptive pseudo-food');
  });

  it('supports several arbitrary foods from mixed dialect/languages', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    const fetchMock = vi.fn(async () => responseWith({
      mealDetected: true,
      mealTitle: 'مقلوبة · لبنة · قهوة بالحليب',
      mealItems: ['مقلوبة بالدجاج', 'لبنة', 'قهوة بالحليب'],
      mealCategory: 'dinner',
      mealContext: '',
    }));
    const result = await extractMealWithGroq('تعشيت مقلوبة بالدجاج ومعاها labneh وشربت café au lait', { language: 'ar' }, fetchMock as any);
    expect(result?.mealItems).toEqual(['مقلوبة بالدجاج', 'لبنة', 'قهوة بالحليب']);
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
    const result = await extractMealWithGroq('كليت بيصارة ولكن ما كليتش معقودة', { language: 'ar' }, fetchMock as any);
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
