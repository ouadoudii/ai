export type SupportedLanguage = 'en' | 'de' | 'fr' | 'ar';

export interface AdaptiveQuestionContext {
  language: SupportedLanguage;
  known: string[];
  unusualFatigue?: boolean;
  lateMealPattern?: boolean;
  lowEnergyPattern?: boolean;
}

export interface AdaptiveQuestion {
  key: 'sleep' | 'mealTiming' | 'energy';
  text: string;
}

const copy: Record<AdaptiveQuestion['key'], Record<SupportedLanguage, string>> = {
  sleep: {
    en: 'How did you sleep last night?',
    de: 'Wie hast du letzte Nacht geschlafen?',
    fr: 'Comment as-tu dormi la nuit dernière ?',
    ar: 'كيف كان نومك البارحة؟',
  },
  mealTiming: {
    en: 'About what time was your last meal?',
    de: 'Ungefähr wann war deine letzte Mahlzeit?',
    fr: 'Vers quelle heure était ton dernier repas ?',
    ar: 'تقريباً متى كانت آخر وجبة؟',
  },
  energy: {
    en: 'How is your energy right now?',
    de: 'Wie ist deine Energie gerade?',
    fr: 'Comment est ton énergie maintenant ?',
    ar: 'كيف هي طاقتك الآن؟',
  },
};

/** Selects only questions that can close a current, relevant data gap. */
export function selectAdaptiveQuestions(context: AdaptiveQuestionContext, limit = 2): AdaptiveQuestion[] {
  const known = new Set(context.known);
  const candidates: AdaptiveQuestion['key'][] = [];

  if (context.unusualFatigue && !known.has('sleep')) candidates.push('sleep');
  if (context.lateMealPattern && !known.has('mealTiming')) candidates.push('mealTiming');
  if (context.lowEnergyPattern && !known.has('energy')) candidates.push('energy');

  return candidates.slice(0, Math.max(0, limit)).map((key) => ({ key, text: copy[key][context.language] }));
}
