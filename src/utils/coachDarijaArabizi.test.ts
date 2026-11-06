import { describe, expect, it } from 'vitest';
import { getCoachChatResponse } from './coachEngine';

describe('Arabic-first coach: Darija and Arabizi intent regression', () => {
  it.each(['شنو كليت اليوم', 'chno klit lyoum', 'ach klit nhar', 'واش كليت نهار'])(
    'answers daily journal questions without inventing meals: %s',
    (question) => {
      const reply = getCoachChatResponse(question, []);
      expect(reply).toContain('لا توجد وجبات مسجلة اليوم');
      expect(reply).not.toMatch(/88%|28%|فشلت|سيئ|عقاب/);
    },
  );

  it.each(['انا 3yan', 'بزاف عيان', 'n3as', 'بغيت ننعس'])(
    'offers rest without a diagnosis: %s',
    (question) => {
      const reply = getCoachChatResponse(question, []);
      expect(reply).toContain('الراحة');
      expect(reply).toContain('لا يمكنني استنتاج');
    },
  );

  it.each(['عندي jou3', 'انا جيعان', 'jo3', 'بغيت حلو'])(
    'normalizes appetite without shame: %s',
    (question) => {
      const reply = getCoachChatResponse(question, []);
      expect(reply).toContain('تغيّر الشهية أمر طبيعي');
      expect(reply).not.toMatch(/ذنب|فشل|عقاب|ممنوع/);
    },
  );

  it.each(['protein', 'بروتين', 'proteine'])(
    'offers culturally relevant protein examples: %s',
    (question) => {
      const reply = getCoachChatResponse(question, []);
      expect(reply).toContain('العدس والحمص والبيض');
    },
  );

  it('handles Arabic diacritics and hamza variants', () => {
    expect(getCoachChatResponse('أَلْيَوْم', [])).toContain('لا توجد وجبات مسجلة اليوم');
  });
});
