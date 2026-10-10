export type CoachLocale = 'de' | 'en' | 'fr' | 'ar';

const copy: Record<CoachLocale, { why: (topic: string) => string; next: string; evidence: string }> = {
  de: {
    why: (topic) => `Warum könnte „${topic}“ für mich relevant sein?`,
    next: 'Was wäre ein kleiner nächster Schritt?',
    evidence: 'Was in meinen bisherigen Einträgen spricht dafür?',
  },
  en: {
    why: (topic) => `Why might “${topic}” matter for me?`,
    next: 'What is one small next step I could try?',
    evidence: 'What in my previous entries supports that?',
  },
  fr: {
    why: (topic) => `Pourquoi « ${topic} » pourrait être pertinent pour moi ?`,
    next: 'Quel petit prochain pas pourrais-je essayer ?',
    evidence: 'Qu’est-ce qui, dans mes entrées précédentes, va dans ce sens ?',
  },
  ar: {
    why: (topic) => `لماذا قد يكون «${topic}» مهمًا بالنسبة لي؟`,
    next: 'ما الخطوة الصغيرة التالية التي يمكنني تجربتها؟',
    evidence: 'ما الذي يدعم ذلك في إدخالاتي السابقة؟',
  },
};

const compactTopic = (question: string) => {
  const normalized = question.trim().replace(/\s+/g, ' ');
  if (normalized.length <= 72) return normalized;
  return `${normalized.slice(0, 69).trimEnd()}…`;
};

/**
 * Builds optional, editable Cary follow-ups after a successful answer.
 * The latest user-authored question is preserved verbatim apart from surrounding/
 * repeated whitespace and is never submitted automatically by this helper.
 */
export const buildCoachFollowUps = (
  question: string,
  answer: string,
  locale: CoachLocale,
): string[] => {
  if (!question.trim() || !answer.trim()) return [];
  const t = copy[locale] ?? copy.en;
  const topic = compactTopic(question);
  return [t.why(topic), t.next, t.evidence];
};
