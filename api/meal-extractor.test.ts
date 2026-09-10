import { describe, expect, it } from 'vitest';
import { extractMealItemsDeterministic } from './meal-extractor';

describe('deterministic multilingual meal extraction', () => {
  it('extracts Darija quantities, preparation and multiple items', () => {
    const result = extractMealItemsDeterministic('كليت جوج بيضات مسلوقين مع الخبز ومن بعد شربت قهوة بالحليب');
    expect(result.mealDetected).toBe(true);
    expect(result.mealItems).toContain('جوج بيض مسلوق');
    expect(result.mealItems).toContain('خبز');
    expect(result.mealItems).toContain('قهوة بالحليب');
  });

  it('understands Moroccan breakfast foods', () => {
    const result = extractMealItemsDeterministic('فالفطور خديت مسمن بالعسل وأتاي بالنعناع');
    expect(result.mealCategory).toBe('breakfast');
    expect(result.mealItems).toContain('مسمن بالعسل');
    expect(result.mealItems).toContain('أتاي بالنعناع');
  });

  it('supports mixed Arabic, French and English', () => {
    const result = extractMealItemsDeterministic('تعشيت poulet grilled مع salade وشربت coffee au lait');
    expect(result.mealItems).toContain('دجاج مشوي');
    expect(result.mealItems).toContain('سلطة');
    expect(result.mealItems).toContain('قهوة بالحليب');
  });

  it('supports Egyptian and Levantine vocabulary', () => {
    const egypt = extractMealItemsDeterministic('اتغديت فراخ مشوية ورز وسلطة');
    expect(egypt.mealItems).toEqual(expect.arrayContaining(['دجاج مشوي', 'أرز', 'سلطة']));
    const levant = extractMealItemsDeterministic('اكلت حمص وخبز وشربت شاي');
    expect(levant.mealItems).toEqual(expect.arrayContaining(['حمص', 'خبز', 'شاي']));
  });

  it('does not add explicitly negated food', () => {
    const result = extractMealItemsDeterministic('كليت مسمن بالعسل ولكن ما شربتش قهوة');
    expect(result.mealItems).toContain('مسمن بالعسل');
    expect(result.mealItems).not.toContain('قهوة');
  });

  it('keeps a beverage while preserving a negated modifier', () => {
    const result = extractMealItemsDeterministic('شربت قهوة بلا سكر');
    expect(result.mealItems).toContain('قهوة بلا سكر');
  });

  it('returns no meal for wellbeing-only speech', () => {
    const result = extractMealItemsDeterministic('نعست سبع ساعات واليوم حاس براسي مزيان');
    expect(result.mealDetected).toBe(false);
    expect(result.mealItems).toEqual([]);
  });

  it('extracts several meal moments from one transcript', () => {
    const result = extractMealItemsDeterministic('فالفطور كليت بيض وخبز، فالغدا كسكس، وبالليل شوربة وسلطة');
    expect(result.mealItems).toEqual(expect.arrayContaining(['بيض', 'خبز', 'كسكس', 'شوربة', 'سلطة']));
  });

  it('understands common French food words', () => {
    const result = extractMealItemsDeterministic("j'ai mangé deux oeufs bouillis avec pain et un yaourt");
    expect(result.mealItems).toEqual(expect.arrayContaining(['deux بيض مسلوق', 'خبز', 'un ياغورت']));
  });

  it('understands common English food words', () => {
    const result = extractMealItemsDeterministic('I had two eggs fried, bread and tea with milk');
    expect(result.mealItems).toEqual(expect.arrayContaining(['two بيض مقلي', 'خبز', 'شاي بالحليب']));
  });
});
