import { describe, expect, it } from 'vitest';
import { getCoachChatResponse } from './coachEngine';

// Real regional user phrasing must receive relevant Arabic guidance without
// inventing personal data or moralizing about meals.
describe('regional Arabic coach intents', () => {
  const cases = [
    ['Egyptian meal recap', 'اكلت ايه النهاردة', 'سجّلة اليوم'],
    ['Levantine meal recap', 'شو اكلت اليوم', 'سجّلة اليوم'],
    ['Gulf meal recap', 'وش اكلت اليوم', 'سجّلة اليوم'],
    ['Egyptian hunger', 'انا جعانة', 'الشهية'],
    ['Gulf hunger', 'انا يوعان', 'الشهية'],
    ['Levantine fullness', 'انا شبعانة', 'الشبع'],
    ['Egyptian fatigue', 'انا تعبانة', 'الراحة'],
  ] as const;

  it.each(cases)('%s uses the relevant supportive Arabic response', (_region, question, expected) => {
    const response = getCoachChatResponse(question, []);
    // Meal recap intentionally reports an empty journal rather than invented meals.
    if (expected === 'سجّلة اليوم') {
      expect(response).toContain('لا توجد وجبات مسجلة اليوم');
    } else if (expected === 'الراحة') {
      expect(response).toContain('الراحة');
    } else {
      expect(response).toContain(expected);
    }
    expect(response).not.toMatch(/(?:failed|bad food|cheat meal|فشلت|طعام سيئ)/i);
  });
  it.each([
    ['Egyptian hunger today', 'النهاردة انا جعانة', 'الشهية'],
    ['Gulf hunger today', 'اليوم انا يوعان', 'الشهية'],
    ['Levantine fullness today', 'اليوم انا شبعانة', 'الشبع'],
    ['Egyptian fatigue today', 'اليوم انا تعبانة', 'الراحة'],
    ['mixed Arabizi hunger today', 'lyoum ana jou3', 'الشهية'],
    ['Moroccan hunger spelling', 'أنا جوعانة اليوم', 'الشهية'],
  ])('%s prioritizes the stated feeling over a date word', (_label, question, expected) => {
    const response = getCoachChatResponse(question, []);
    expect(response).toContain(expected);
    expect(response).not.toContain('لا توجد وجبات مسجلة اليوم');
    expect(response).not.toMatch(/فشل|عقاب|ذنب|ممنوع|88%|28%/);
  });

  it.each(['النهاردة', 'النهارده', 'النهار ده', 'naharda', 'ennaharda'])(
    'recognizes standalone Egyptian today recap without inventing meals: %s',
    (question) => {
      const response = getCoachChatResponse(question, []);
      expect(response).toContain('لا توجد وجبات مسجلة اليوم');
      expect(response).not.toMatch(/فشل|عقاب|ذنب|ممنوع|88%|28%/);
    },
  );
  it.each(['النهاردة انا جعانة', 'naharda ana jou3'])(
    'keeps feelings above Egyptian today wording: %s',
    (question) => {
      const response = getCoachChatResponse(question, []);
      expect(response).toContain('الشهية');
      expect(response).not.toContain('لا توجد وجبات مسجلة اليوم');
    },
  );

  it.each([
    'ما كليتش اليوم',
    'مكليتش النهاردة',
    'ما اكلتش اليوم',
    'ما اكلت اليوم',
    'ma klitch lyoum',
    'maklitch',
    'ma akaltsh elnaharda',
    'ma klit lyom',
  ])('responds without shame to a stated missed meal: %s', (question) => {
    const response = getCoachChatResponse(question, []);
    expect(response).toContain('فهمت أنك لم تأكل اليوم');
    expect(response).toContain('لا أفترض سبب ذلك');
    expect(response).toContain('دون لوم أو ضغط');
    expect(response).not.toContain('لم تسجّل وجبة');
    expect(response).not.toContain('لا توجد وجبات مسجلة اليوم');
    expect(response).not.toMatch(/فشل|عقاب|ذنب|ممنوع|88%|28%/);
    expect(response).toMatch(/[\u0600-\u06ff]/);
  });

  it.each([
    'ما عنديش شهية اليوم',
    'ما عندي شهية اليوم',
    'مش نفسي اكل النهاردة',
    'ما عنديش نفس اليوم',
    'مالي نفس اكل اليوم',
    'ma 3andich chahiya lyoum',
    'ma 3ndich chahiya',
    'machi jay3 lyoum',
  ])('supports loss of appetite without blame or invented journal facts: %s', (question) => {
    const response = getCoachChatResponse(question, []);
    expect(response).toContain('تتغيّر الشهية');
    expect(response).toContain('دون ضغط أو لوم');
    expect(response).not.toContain('لا توجد وجبات مسجلة اليوم');
    expect(response).not.toMatch(/فشل|عقاب|ذنب|ممنوع|88%|28%/);
  });

  it.each([
    'مش جعان النهاردة',
    'مش جعانة اليوم',
    'ماني جوعان اليوم',
    'مو جوعانة اليوم',
    'ma jay3ch lyoum',
  ])('recognizes explicit absence of hunger without suggesting a failed goal: %s', (question) => {
    const response = getCoachChatResponse(question, []);
    expect(response).toContain('تتغيّر الشهية');
    expect(response).toContain('دون ضغط أو لوم');
    expect(response).not.toContain('لا توجد وجبات مسجلة اليوم');
    expect(response).not.toMatch(/فشل|عقاب|ذنب|ممنوع|88%|28%/);
  });

  it.each([
    'ما كليتش غير تفاحة اليوم',
    'ما اكلتش بس تمر اليوم',
    'ma klitch ghir tfa7a lyoum',
    'maklitch bass tamr',
  ])('does not misreport limited eating as no food all day: %s', (question) => {
    const response = getCoachChatResponse(question, []);
    expect(response).toContain('تناولت شيئًا اليوم');
    expect(response).toContain('دون لوم أو ضغط');
    expect(response).not.toContain('لم تأكل اليوم');
    expect(response).not.toContain('لا توجد وجبات مسجلة اليوم');
    expect(response).not.toMatch(/فشل|عقاب|ذنب|ممنوع|88%|28%/);
  });

  it('does not confuse a normal daily recap with a skipped-meal statement', () => {
    expect(getCoachChatResponse('شنو كليت اليوم', [])).toContain('لا توجد وجبات مسجلة اليوم');
  });

  it.each([
    'ما فطرتش اليوم', 'مفطرتش النهاردة', 'ما تغديتش اليوم',
    'ما تعشيتش اليوم', 'ma ftartch lyoum', 'ma tghdditch lyoum',
    'ma t3chitch lyom',
  ])('does not infer a whole day without food from one missed meal: %s', (question) => {
    const response = getCoachChatResponse(question, []);
    expect(response).toContain('إحدى الوجبات');
    expect(response).toContain('بقية يومك');
    expect(response).toContain('دون لوم أو ضغط');
    expect(response).not.toContain('لم تأكل اليوم');
    expect(response).not.toContain('لا توجد وجبات مسجلة اليوم');
    expect(response).not.toMatch(/فشل|عقاب|ذنب|ممنوع|88%|28%/);
  });

});
