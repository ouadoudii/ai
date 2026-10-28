import type { AppLanguage } from '../i18n';
import type { NutritionArchetype } from '../types';

type OrientationCopy = {
  label: string;
  title: string;
  description: string;
  progress: string;
  confidence: string;
  dataBasis: string;
};

/**
 * Insights describe observed entries, not a person's nutrition "type".
 * Keep the legacy archetype/target arguments for existing callers and saved
 * data compatibility, but never turn either into a visible identity or quota.
 */
export function buildEarlyOrientationCopy(
  language: AppLanguage,
  _archetype: NutritionArchetype,
  dataPoints: number,
  _targetDataPoints = 12,
): OrientationCopy {
  const count = Math.max(0, Math.trunc(Number.isFinite(dataPoints) ? dataPoints : 0));
  const text: Record<AppLanguage, {
    label: string;
    title: string;
    description: (n: number) => string;
    emptyTitle: string;
    emptyDescription: string;
    progress: string;
    basis: (n: number) => string;
    emptyBasis: string;
    status: string;
    emptyStatus: string;
  }> = {
    ar: {
      label: 'ملاحظاتك حتى الآن',
      title: 'إيقاعك، بلا تصنيفات',
      description: n => `لديك ${n} من اللحظات المسجّلة. نعرض ما يتكرر في يومك مع الوقت، من غير تصنيف لك أو تقييم لطعامك.`,
      emptyTitle: 'ابدأ بلحظة على راحتك',
      emptyDescription: 'يمكنك تدوين ما يهمك حين يناسبك. لا حاجة إلى تسجيل كل يوم.',
      progress: 'التسجيل اختياري، والأيام الهادئة جزء من الحياة.',
      basis: n => `سجّلت ${n} من اللحظات حتى الآن`,
      emptyBasis: 'لا توجد لحظات مسجّلة بعد',
      status: 'ملاحظات من سجلك',
      emptyStatus: 'البداية على راحتك',
    },
    en: {
      label: 'Your observations so far',
      title: 'Your rhythm, not a label',
      description: n => `You have ${n} recorded moments. We look for what repeats over time, without classifying you or judging your food.`,
      emptyTitle: 'Begin with a moment, when you like',
      emptyDescription: 'Record what matters whenever it suits you. Daily logging is not required.',
      progress: 'Logging is optional, and quiet days are part of life.',
      basis: n => `${n} moments recorded so far`,
      emptyBasis: 'No moments recorded yet',
      status: 'Notes from your journal',
      emptyStatus: 'Begin at your own pace',
    },
    de: {
      label: 'Deine bisherigen Beobachtungen',
      title: 'Dein Rhythmus, kein Etikett',
      description: n => `Du hast ${n} Momente festgehalten. Wir zeigen, was sich mit der Zeit wiederholt, ohne dich oder dein Essen zu bewerten.`,
      emptyTitle: 'Beginne mit einem Moment, wenn du magst',
      emptyDescription: 'Halte fest, was dir wichtig ist, wann es dir passt. Tägliche Einträge sind nicht nötig.',
      progress: 'Einträge sind freiwillig. Pausen gehören dazu.',
      basis: n => `${n} Momente bisher festgehalten`,
      emptyBasis: 'Noch keine Momente festgehalten',
      status: 'Beobachtungen aus deinem Journal',
      emptyStatus: 'Beginne in deinem Tempo',
    },
    fr: {
      label: 'Tes observations jusqu’ici',
      title: 'Ton rythme, sans étiquette',
      description: n => `Tu as noté ${n} moments. Nous observons ce qui se répète avec le temps, sans te classer ni juger tes repas.`,
      emptyTitle: 'Commence par un moment, à ton rythme',
      emptyDescription: 'Note ce qui compte quand tu le souhaites. Pas besoin de le faire chaque jour.',
      progress: 'Noter est facultatif, les pauses font partie de la vie.',
      basis: n => `${n} moments notés jusqu’ici`,
      emptyBasis: 'Aucun moment noté pour le moment',
      status: 'Observations de ton journal',
      emptyStatus: 'Commence à ton rythme',
    },
  };
  const c = text[language] || text.ar;
  return {
    label: c.label,
    title: count > 0 ? c.title : c.emptyTitle,
    description: count > 0 ? c.description(count) : c.emptyDescription,
    progress: c.progress,
    confidence: count > 0 ? c.status : c.emptyStatus,
    dataBasis: count > 0 ? c.basis(count) : c.emptyBasis,
  };
}
