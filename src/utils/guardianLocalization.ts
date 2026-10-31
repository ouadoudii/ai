import { AppLanguage } from '../i18n';
import { NutritionArchetype } from '../types';

type GuardianCopy = {
  title: string; type: string; description: string; activeAlarm: (count: number) => string; allClear: string;
  testAlarm: string; simulator: string; reacts: string; sleep: string; sleepDetail: string; stressMeal: string;
  stressDetail: string; crash: string; crashDetail: string; reset: string; noWarnings: string; noIntervention: string;
  balanced: string; guardianActive: string; acute: string; recommendation: string; done: string; why: string;
  countermeasure: string; immediate: string; archetypes: Record<NutritionArchetype, string>;
};

// Visible Guardian copy is Arabic-only, even for a caller passing a legacy
// stored locale. Keep the API parameter for compatibility with existing
// components; never expose stale English/German/French alarm language.
const arabicCopy: GuardianCopy = {
  title: 'مساحة لطيفة للاهتمام بنفسك',
  type: 'نمطك',
  description: 'أفكار بسيطة تدعم راحتك، دون أحكام أو ضغط.',
  activeAlarm: () => 'أفكار يمكنك تجاهلها',
  allClear: 'خذ يومك على مهل',
  testAlarm: 'اختبار تنبيه',
  simulator: 'تجربة اقتراحات الدعم (وضع الاختبار)',
  reacts: 'اقتراحات تناسب احتياجاتك',
  sleep: 'نقص النوم',
  sleepDetail: 'ليلة نوم قصيرة',
  stressMeal: 'الأكل تحت الضغط',
  stressDetail: 'وجبة سريعة مع الهاتف',
  crash: 'طاقة أقل بعد الظهر',
  crashDetail: 'شعور بالتعب',
  reset: 'إعادة ضبط',
  noWarnings: 'لا توجد اقتراحات إضافية',
  noIntervention: 'هنا متى احتجت',
  balanced: 'لكل يوم إيقاعه الخاص. نحن هنا لنرافقك بلطف متى احتجت.',
  guardianActive: 'معك بلطف',
  acute: 'اقتراح لطيف',
  recommendation: 'فكرة لك',
  done: 'إخفاء الفكرة',
  why: 'ما الذي لاحظناه؟',
  countermeasure: 'ما قد يساعدك',
  immediate: 'إن أحببت:',
  archetypes: {
    protein_performer: 'نمط الأداء بالبروتين',
    circadian_rhythm: 'نمط الإيقاع اليومي',
    intermittent_balancer: 'نمط التوازن المتقطع',
    intuitive_mindful: 'نمط الأكل الحدسي',
    stress_craver: 'نمط الأكل تحت الضغط',
    carb_sensitive: 'نمط حساس للكربوهيدرات',
  },
};

export const getGuardianCopy = (_language: AppLanguage): GuardianCopy => arabicCopy;
