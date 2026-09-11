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

  it('recognizes the exact live Darija phrase خبيزة بالفرماج', () => {
    const result = extractMealItemsDeterministic('كليت خبيزة بالفرماج.');
    expect(result.mealDetected).toBe(true);
    expect(result.mealItems).toEqual(['خبز بالجبن']);
    expect(result.mealTitle).toBe('خبز بالجبن');
  });

  it.each([
    'كليت خبزة بالفرماج',
    'كليت الخبيزة بالفرماج',
    'كليت khobza fromage',
    'j ai mangé pain au fromage',
    'I had bread with cheese',
  ])('recognizes bread-with-cheese variant: %s', (speech) => {
    const result = extractMealItemsDeterministic(speech);
    expect(result.mealDetected).toBe(true);
    expect(result.mealItems).toContain('خبز بالجبن');
    expect(result.mealItems).not.toContain('جبن');
  });

  it('understands Moroccan breakfast foods', () => {
    const result = extractMealItemsDeterministic('فالفطور خديت مسمن بالعسل وأتاي بالنعناع');
    expect(result.mealCategory).toBe('breakfast');
    expect(result.mealItems).toContain('مسمن بالعسل');
    expect(result.mealItems).toContain('أتاي بالنعناع');
  });

  it.each([
    ['فطرت بيض وخبز', 'breakfast'],
    ['اتفطرت بيض وخبز', 'breakfast'],
    ['تغديت كسكس وسلطة', 'lunch'],
    ['اتغديت فراخ ورز', 'lunch'],
    ['غديت طاجين وخبز', 'lunch'],
    ['تعشيت شوربة وسلطة', 'dinner'],
    ['اتعشيت سمك ورز', 'dinner'],
    ['عشيت حريرة وخبز', 'dinner'],
  ])('classifies Arabic dialect meal-time verb %s as %s', (speech, expected) => {
    const result = extractMealItemsDeterministic(speech);
    expect(result.mealDetected).toBe(true);
    expect(result.mealCategory).toBe(expected);
  });

  it.each([
    'ترويقت بيض وخبز',
    'عملت ترويقة حمص وخبز وشاي',
    'تريقت بيض وجبن',
    'بالريوق أكلت تمر وشربت حليب',
    'بالريوك أكلت بيض وخبز',
  ])('maps Levantine and Gulf breakfast wording to breakfast: %s', (speech) => {
    const result = extractMealItemsDeterministic(speech);
    expect(result.mealDetected).toBe(true);
    expect(result.mealCategory).toBe('breakfast');
  });

  it.each([
    ['الصبح كليت بيض وخبز', 'breakfast'],
    ['وقت الظهر كليت كسكس وسلطة', 'lunch'],
    ['بالليل كليت شوربة وخبز', 'dinner'],
    ['morgens hatte ich Eier und Brot', 'breakfast'],
    ['mittags hatte ich Couscous und Salat', 'lunch'],
    ['abends hatte ich Suppe und Brot', 'dinner'],
    ['this morning I had eggs and bread', 'breakfast'],
    ['at noon I had couscous and salad', 'lunch'],
    ['tonight I had soup and bread', 'dinner'],
    ['ce matin j ai mangé des oeufs avec pain', 'breakfast'],
    ['à midi j ai mangé couscous et salade', 'lunch'],
    ['ce soir j ai mangé soupe avec pain', 'dinner'],
  ])('assigns natural daypart phrase %s to %s', (speech, expected) => {
    const result = extractMealItemsDeterministic(speech);
    expect(result.mealDetected).toBe(true);
    expect(result.mealCategory).toBe(expected);
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
    expect(egypt.mealCategory).toBe('lunch');
    const levant = extractMealItemsDeterministic('اكلت حمص وخبز وشربت شاي');
    expect(levant.mealItems).toEqual(expect.arrayContaining(['حمص', 'خبز', 'شاي']));
  });

  it('does not add explicitly negated food', () => {
    const result = extractMealItemsDeterministic('كليت مسمن بالعسل ولكن ما شربتش قهوة');
    expect(result.mealItems).toContain('مسمن بالعسل');
    expect(result.mealItems).not.toContain('قهوة');
  });

  it('does not add negated Darija bread with cheese', () => {
    const result = extractMealItemsDeterministic('ما كليتش خبيزة بالفرماج وشربت أتاي');
    expect(result.mealItems).not.toContain('خبز بالجبن');
    expect(result.mealItems).toContain('أتاي');
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

  it.each([
    ['morgens hatte ich zwei Eier und Brot', 'zwei بيض'],
    ['morgens hatte ich zwei gekochte Eier und Brot', 'zwei بيض مسلوق'],
    ['abends hatte ich drei Kartoffeln und Salat', 'drei بطاطا'],
  ])('preserves natural German quantities from voice: %s', (speech, expectedItem) => {
    const result = extractMealItemsDeterministic(speech);
    expect(result.mealDetected).toBe(true);
    expect(result.mealItems).toContain(expectedItem);
  });

  it.each([
    ['فطرت ٢ بيضات وخبز', '٢ بيض'],
    ['فطرت ۳ بيضات وخبز', '۳ بيض'],
    ['تعشيت ٤ قطع دجاج ورز', '٤ دجاج'],
  ])('preserves Arabic-script numeric quantities from voice: %s', (speech, expectedItem) => {
    const result = extractMealItemsDeterministic(speech);
    expect(result.mealDetected).toBe(true);
    expect(result.mealItems).toContain(expectedItem);
  });
});