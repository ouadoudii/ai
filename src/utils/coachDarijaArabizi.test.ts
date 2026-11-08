import { describe, expect, it } from 'vitest';
import { getCoachChatResponse } from './coachEngine';

describe('Arabic-first coach: Darija and Arabizi intent regression', () => {
  it.each(['شنو كليت اليوم', 'chno klit lyoum', 'chno klit lyom', 'ach klit nhari', 'ach klit nhar', 'واش كليت نهار'])(
    'answers daily journal questions without inventing meals: %s',
    (question) => {
      const reply = getCoachChatResponse(question, []);
      expect(reply).toContain('لا توجد وجبات مسجلة اليوم');
      expect(reply).not.toMatch(/88%|28%|فشلت|سيئ|عقاب/);
    },
  );

  it.each(['ana 3yane', 'ana na3s', 'انا 3yan', 'بزاف عيان', 'n3as', 'بغيت ننعس'])(
    'offers rest without a diagnosis: %s',
    (question) => {
      const reply = getCoachChatResponse(question, []);
      expect(reply).toContain('الراحة');
      expect(reply).toContain('لا يمكنني استنتاج');
    },
  );

  it.each(['ana mjou3', 'joo3', 'عندي jou3', 'انا جيعان', 'jo3', 'بغيت حلو'])(
    'normalizes appetite without shame: %s',
    (question) => {
      const reply = getCoachChatResponse(question, []);
      expect(reply).toContain('تغيّر الشهية أمر طبيعي');
      expect(reply).not.toMatch(/ذنب|فشل|عقاب|ممنوع/);
    },
  );

  it.each(['protein', 'بروتين', 'proteine', '3dess', '7oms', 'عدس'])(
    'offers culturally relevant protein examples: %s',
    (question) => {
      const reply = getCoachChatResponse(question, []);
      expect(reply).toContain('العدس والحمص والبيض');
    },
  );

  it.each(['chb3t', 'chba3t', 'شبعت'])('recognizes fullness without moralizing: %s', (question) => {
    const reply = getCoachChatResponse(question, []);
    expect(reply).toContain('الشبع');
    expect(reply).not.toMatch(/عقاب|فشل|ممنوع/);
  });

  it('recognizes stretched Arabic words without changing supportive guidance', () => {
    const reply = getCoachChatResponse('عـدس', []);
    expect(reply).toContain('العدس والحمص والبيض');
    expect(reply).not.toMatch(/ذنب|فشل|عقاب|ممنوع/);
  });

  it('handles Arabic diacritics and hamza variants', () => {
    expect(getCoachChatResponse('أَلْيَوْم', [])).toContain('لا توجد وجبات مسجلة اليوم');
  });
});
