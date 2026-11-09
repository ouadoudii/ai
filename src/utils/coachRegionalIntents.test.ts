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
});
