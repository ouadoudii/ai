import type { CoachingGoal, FoodMoment } from '../types';
import type { DailyCoachingMetrics } from './coachEngine';

/** Arabic-only presentation copy. Stored historical entries and messages are never rewritten. */
export const ARABIC_COACH_SUGGESTIONS = [
  '📊 ماذا تخبرني ملاحظاتي؟',
  '🛡️ ما العلامات التي يراقبها المرشد؟',
  '🎙️ ابدأ تسجيلًا صوتيًا',
  '⚡ كيف أتجنب هبوط الطاقة بعد الظهر؟',
] as const;

export const getArabicCoachWelcome = (hour: number): string => {
  const greeting = hour >= 5 && hour < 11 ? 'صباح الخير' : hour >= 11 && hour < 16 ? 'طاب نهارك' : 'مساء الخير';
  return `مرحبًا، ${greeting}! أنا مرشد إيقاع. أساعدك على فهم العلاقة بين نومك وطعامك وطاقتك. ما الذي تود معرفته اليوم؟`;
};

/** Never display an unreported body signal as a measurement. Zero remains explicit. */
export const formatObservedMealSignals = (moment: Pick<FoodMoment, 'hungerLevel' | 'fullnessLevel'>): string => {
  const format = (label: string, value: number | undefined) =>
    `${label}: ${typeof value === 'number' && Number.isFinite(value) ? `${value}/5` : 'لم يُسجّل'}`;
  return `${format('الجوع', moment.hungerLevel)} • ${format('الشبع', moment.fullnessLevel)}`;
};

export const getArabicCoachSummary = (
  metrics: Pick<DailyCoachingMetrics, 'satietyBalanceScore' | 'satietyObservations' | 'screenFreeRatio' | 'screenFreeObservations'>,
  hasMoments: boolean,
): string => {
  if (!hasMoments) return 'سجّل وجبتك التالية لتحصل على ملاحظات تساعدك على فهم عاداتك.';
  if (metrics.satietyObservations > 0 && metrics.satietyBalanceScore < 75)
    return 'إذا أحببت، لاحظ إشارات الشبع في وجباتك المقبلة دون ضغط أو أحكام.';
  if (metrics.screenFreeObservations > 0 && metrics.screenFreeRatio < 60)
    return 'إذا كان ذلك مناسبًا لك، جرّب لحظة هادئة بعيدًا عن الشاشات أثناء إحدى وجباتك.';
  if (metrics.satietyObservations === 0 && metrics.screenFreeObservations === 0)
    return 'سجّلت وجبتك. يمكنك إضافة شعورك بالجوع أو الشبع متى أحببت، دون أي ضغط.';
  return 'شكرًا لمشاركة ملاحظاتك. تابع استكشاف ما يناسبك في يومك بهدوء.';
};

export const getArabicCoachFocus = (hasMoments: boolean): { title: string; tip: string } =>
  hasMoments
    ? {
        title: 'إشارة الشبع بعد عشرين دقيقة',
        tip: 'يحتاج الجسم بعض الوقت للشعور بالشبع. خذ استراحة قصيرة في منتصف الوجبة وانتبه إلى إحساسك.',
      }
    : {
        title: 'ابدأ بوجبة واحدة بوعي',
        tip: 'قبل أول لقمة، خذ ثلاثة أنفاس هادئة وحدّد مستوى جوعك من ١ إلى ٥.',
      };

const goalCopy: Record<string, { title: string; description: string; unit: string }> = {
  'goal-1': { title: 'قيّم جوعك قبل كل وجبة', description: 'حدّد مستوى الجوع من ١ إلى ٥ قبل البدء بالأكل.', unit: 'وجبات' },
  'goal-2': { title: 'تناول الطعام بعيدًا عن الشاشات', description: 'استمتع بوجبتين رئيسيتين دون هاتف أو تلفاز أو حاسوب.', unit: 'وجبات' },
  'goal-3': { title: 'توقّف عند الشبع المريح', description: 'توقّف عندما تشعر بالشبع دون امتلاء زائد.', unit: 'وجبات' },
  'goal-4': { title: 'أضف مصدرًا للبروتين', description: 'أضف مصدرًا مناسبًا للبروتين إلى الوجبات الرئيسية.', unit: 'حصص' },
};

export const getArabicGoalCopy = (goal: CoachingGoal) =>
  goalCopy[goal.id] ?? { title: goal.title, description: goal.description, unit: goal.unit };

export const ARABIC_COACH_UNAVAILABLE = 'تعذّر الحصول على رد الآن. تم الاحتفاظ بسؤالك، ويمكنك المحاولة مرة أخرى لاحقًا.';
