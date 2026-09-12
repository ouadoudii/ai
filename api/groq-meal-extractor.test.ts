import { afterEach, describe, expect, it, vi } from 'vitest';
import { extractMealWithGroq } from './groq-meal-extractor';

const originalGroqKey = process.env.GROQ_API_KEY;
afterEach(() => {
  vi.restoreAllMocks();
  if (originalGroqKey === undefined) delete process.env.GROQ_API_KEY;
  else process.env.GROQ_API_KEY = originalGroqKey;
});

function responseWith(result: unknown, ok = true) {
  return { ok, json: async () => ({ choices: [{ message: { content: JSON.stringify(result) } }] }) } as Response;
}

const emptyWellbeing = { sleepHours: 0, sleepQuality: 0, wakeFeeling: '', wellbeingEntries: [] };

describe('Groq semantic voice journal extraction', () => {
  it('understands a complete free-form day report and keeps meals separated', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    let requestBody = '';
    const fetchMock = vi.fn(async (_url: string, options?: RequestInit) => {
      requestBody = String(options?.body || '');
      return responseWith({
        mealDetected: true, mealTitle: 'بيض مسلوق وخبز', mealItems: ['جوج بيضات مسلوقين', 'خبز'], mealCategory: 'breakfast', mealContext: '',
        meals: [
          { category: 'breakfast', timeOfDay: 'morning', time: '', mealTitle: 'بيض مسلوق وخبز', mealItems: ['جوج بيضات مسلوقين', 'خبز'], hungerBefore: 0, fullnessAfter: 0 },
          { category: 'snack', timeOfDay: 'morning', time: '', mealTitle: 'كرواسون', mealItems: ['كرواسون'], hungerBefore: 0, fullnessAfter: 0 },
          { category: 'lunch', timeOfDay: 'midday', time: '', mealTitle: 'كسكس بالخضرة', mealItems: ['كسكس بالخضرة'], hungerBefore: 4, fullnessAfter: 0 },
        ],
        sleepHours: 7.5, sleepQuality: 4, wakeFeeling: 'tired',
        wellbeingEntries: [
          { timeOfDay: 'morning', energyLevel: 2, mood: '', stressLevel: 0, waterGlasses: 0, note: 'فقت عيان شوية' },
          { timeOfDay: 'midday', energyLevel: 4, mood: 'energized', stressLevel: 0, waterGlasses: 0, note: 'من بعد الغدا حسيت بالطاقة' },
        ],
      });
    });

    const transcript = 'نعست سبع ساعات ونص وفقت عيان شوية. فالفطور كليت جوج بيضات مسلوقين وخبز، من بعد كليت كرواسون. فالغدا كليت كسكس بالخضرة وكنت جوعان بزاف، ومن بعد الغدا حسيت بالطاقة مزيانة.';
    const result = await extractMealWithGroq(transcript, { timeOfDay: 'midday', currentHour: 14, language: 'ar' }, fetchMock as any);

    expect(result?.meals).toHaveLength(3);
    expect(result?.meals.map(m => m.category)).toEqual(['breakfast', 'snack', 'lunch']);
    expect(result?.meals[2].hungerBefore).toBe(4);
    expect(result?.sleepHours).toBe(7.5);
    expect(result?.wellbeingEntries).toEqual(expect.arrayContaining([expect.objectContaining({ timeOfDay: 'morning', energyLevel: 2 }), expect.objectContaining({ timeOfDay: 'midday', energyLevel: 4 })]));

    const body = JSON.parse(requestBody);
    expect(body.response_format.json_schema.strict).toBe(true);
    expect(body.messages[0].content).toContain('COMPLETE message');
    expect(body.messages[0].content).toContain('one meals[] entry PER distinct meal moment');
    expect(body.messages[0].content).toContain('sleep, energy, mood, stress');
  });

  it('accepts a completely unseen regional dish without a static dictionary entry', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    const fetchMock = vi.fn(async () => responseWith({
      mealDetected: true, mealTitle: 'رفيسة بالدجاج والزبيب', mealItems: ['رفيسة بالدجاج والزبيب'], mealCategory: 'lunch', mealContext: '',
      meals: [{ category: 'lunch', timeOfDay: 'midday', time: '', mealTitle: 'رفيسة بالدجاج والزبيب', mealItems: ['رفيسة بالدجاج والزبيب'], hungerBefore: 0, fullnessAfter: 0 }],
      ...emptyWellbeing,
    }));
    const result = await extractMealWithGroq('كليت رفيسة بالدجاج والزبيب', { language: 'ar' }, fetchMock as any);
    expect(result?.mealItems).toEqual(['رفيسة بالدجاج والزبيب']);
  });

  it('can capture wellbeing even when no meal is mentioned', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    const fetchMock = vi.fn(async () => responseWith({
      mealDetected: false, mealTitle: '', mealItems: [], mealCategory: '', mealContext: '', meals: [],
      sleepHours: 6, sleepQuality: 2, wakeFeeling: 'exhausted',
      wellbeingEntries: [{ timeOfDay: 'morning', energyLevel: 1, mood: '', stressLevel: 4, waterGlasses: 0, note: 'مرهق ومتوتر' }],
    }));
    const result = await extractMealWithGroq('نعست 6 ساعات وفقت مهلوك ومقلق بزاف', { language: 'ar' }, fetchMock as any);
    expect(result?.mealDetected).toBe(false);
    expect(result?.sleepHours).toBe(6);
    expect(result?.wellbeingEntries[0]).toMatchObject({ energyLevel: 1, stressLevel: 4 });
  });

  it('omits uncertain ASR fragments rather than inventing pseudo-foods', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    let requestBody = '';
    const fetchMock = vi.fn(async (_url: string, options?: RequestInit) => {
      requestBody = String(options?.body || '');
      return responseWith({ mealDetected: true, mealTitle: 'بيض وخبز', mealItems: ['بيض', 'خبز'], mealCategory: 'breakfast', mealContext: '', meals: [], ...emptyWellbeing });
    });
    await extractMealWithGroq('كليت بيض وخبز وشربت واحد الحاجة ما باناش', { language: 'ar' }, fetchMock as any);
    expect(JSON.parse(requestBody).messages[0].content).toContain('omit it rather than guessing');
  });

  it('normalizes multilingual provider labels to the canonical journal enums', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    const fetchMock = vi.fn(async () => responseWith({
      mealDetected: true, mealTitle: 'بيض وخبز', mealItems: ['بيض', 'خبز'], mealCategory: 'الفُطُور', mealContext: '',
      meals: [
        { category: 'الفُطُور', timeOfDay: 'الصَّبَاح', time: '', mealTitle: 'بيض وخبز', mealItems: ['بيض', 'خبز'], hungerBefore: 0, fullnessAfter: 0 },
        { category: 'Déjeuner', timeOfDay: 'midi', time: '', mealTitle: 'couscous', mealItems: ['couscous'], hungerBefore: 0, fullnessAfter: 0 },
        { category: 'Abendessen', timeOfDay: 'Abend', time: '', mealTitle: 'Suppe', mealItems: ['Suppe'], hungerBefore: 0, fullnessAfter: 0 },
      ],
      ...emptyWellbeing,
      wellbeingEntries: [{ timeOfDay: 'المَسَاء', energyLevel: 3, mood: 'okay', stressLevel: 0, waterGlasses: 0, note: '' }],
    }));

    const result = await extractMealWithGroq('فالفطور بيض وخبز، déjeuner couscous، Abendessen Suppe', { language: 'ar' }, fetchMock as any);
    expect(result?.mealCategory).toBe('breakfast');
    expect(result?.meals.map(meal => [meal.category, meal.timeOfDay])).toEqual([
      ['breakfast', 'morning'], ['lunch', 'midday'], ['dinner', 'evening'],
    ]);
    expect(result?.wellbeingEntries[0]?.timeOfDay).toBe('evening');
  });

  it('returns null on provider failure so endpoint recovery remains possible', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    const fetchMock = vi.fn(async () => responseWith({}, false));
    await expect(extractMealWithGroq('أي رسالة', {}, fetchMock as any)).resolves.toBeNull();
  });

  it('does not call provider when Groq key is unavailable', async () => {
    delete process.env.GROQ_API_KEY;
    const fetchMock = vi.fn();
    await expect(extractMealWithGroq('كليت حاجة', {}, fetchMock as any)).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
