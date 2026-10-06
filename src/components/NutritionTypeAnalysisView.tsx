import React from 'react';
import { Activity, Clock3, FlaskConical, Plus, PawPrint, Sparkles, Repeat2 } from 'lucide-react';
import { FoodMoment, DailyCheckIn } from '../types';
import { buildPatternInsights } from '../utils/patternInsights';
import { localizePatternInsight } from '../utils/patternInsightLocalization';
import { patternTitles } from '../utils/patternTitleLocalization';
import { analyzeNutritionType } from '../utils/nutritionTypeEngine';
import { buildEarlyOrientationCopy, getAnimalTypeNames } from '../utils/earlyOrientation';
import { getRecurringMeals } from '../utils/recurringMeals';
import { getMealRhythmShift, localizeMealRhythmShift } from '../utils/mealRhythmShift';
import { getMealVarietyInsight } from '../utils/mealVariety';
import { useLanguage, type AppLanguage } from '../i18n';

interface Props { moments: FoodMoment[]; checkIns: DailyCheckIn[]; onOpenCheckIn: () => void; onOpenAddMoment: () => void; }

const intro: Record<AppLanguage, string> = { ar: 'كل لحظة تضيف جزءاً من الصورة. عندما يتكرر شيء مفيد، ستجده هنا — ببساطة ومن دون أحكام.', de: 'Jeder Moment ergänzt ein Stück des Bildes. Wenn sich etwas Hilfreiches wiederholt, findest du es hier — einfach und ohne zu urteilen.', fr: 'Chaque moment complète ton image. Quand un signal utile se répète, tu le trouveras ici — simplement et sans jugement.', en: 'Every moment adds a piece to the picture. When something useful repeats, you’ll find it here — simply and without judgment.' };
const rhythmLabel: Record<AppLanguage, string> = { ar: 'إيقاعك الشخصي', de: 'Dein persönlicher Rhythmus', fr: 'Ton rythme personnel', en: 'Your personal rhythm' };
const learningText: Record<AppLanguage, string> = { ar: 'البداية موجودة. أضف لحظات أخرى وسنُحدّث توجّهك ونربط النقاط من أجلك.', de: 'Der Anfang ist da. Mit jedem weiteren Moment aktualisieren wir deine Orientierung und machen Zusammenhänge sichtbarer.', fr: 'Le début est là. Chaque nouveau moment affine ton orientation et rend les liens plus visibles.', en: 'The start is here. Every new moment refines your orientation and makes connections clearer.' };
const varietyCopy: Record<AppLanguage, { title: string; body: (distinct: number, total: number) => string; note: string }> = {
  en: { title: 'Your recent meal variety', body: (d,t) => `You logged ${d} different meals across your last ${t} real meals.`, note: 'An observation from your journal, not a nutrition judgement.' },
  de: { title: 'Deine Mahlzeitenvielfalt zuletzt', body: (d,t) => `Du hast ${d} verschiedene Mahlzeiten unter deinen letzten ${t} echten Mahlzeiten erfasst.`, note: 'Eine Beobachtung aus deinem Tagebuch, keine Ernährungsbewertung.' },
  fr: { title: 'La variété récente de tes repas', body: (d,t) => `Tu as enregistré ${d} repas différents parmi tes ${t} derniers repas réels.`, note: 'Une observation de ton journal, pas un jugement nutritionnel.' },
  ar: { title: 'تنوع وجباتك مؤخراً', body: (d,t) => `سجّلت ${d} وجبات مختلفة ضمن آخر ${t} وجبات حقيقية.`, note: 'ملاحظة من سجلك فقط، وليست تقييماً غذائياً.' },
};
const recurringCopy: Record<AppLanguage, { title: string; description: string; count: (n: number) => string }> = {
  de: { title: 'Deine wiederkehrenden Mahlzeiten', description: 'Was bei dir öfter auf dem Teller landet – aus deinen echten Momenten erkannt.', count: n => `${n}× erfasst` },
  en: { title: 'Your recurring meals', description: 'What keeps coming back to your plate, detected from your real moments.', count: n => `logged ${n}×` },
  fr: { title: 'Tes repas récurrents', description: 'Ce qui revient souvent dans ton assiette, détecté à partir de tes vrais moments.', count: n => `${n}× enregistré` },
  ar: { title: 'وجباتك المتكررة', description: 'ما يتكرر في طبقك، بناءً على لحظاتك الحقيقية.', count: n => `سُجّلت ${n}×` },
};

export const NutritionTypeAnalysisView: React.FC<Props> = ({ moments, checkIns, onOpenCheckIn, onOpenAddMoment }) => {
  const { language, t } = useLanguage();
  const insights = React.useMemo(() => buildPatternInsights(moments, checkIns), [moments, checkIns]);
  const recurringMeals = React.useMemo(() => getRecurringMeals(moments), [moments]);
  const mealVariety = React.useMemo(() => getMealVarietyInsight(moments), [moments]);
  const mealRhythmShift = React.useMemo(() => getMealRhythmShift(moments), [moments]);
  const localizedRhythmShift = mealRhythmShift ? localizeMealRhythmShift(mealRhythmShift, language) : null;
  const profile = React.useMemo(() => analyzeNutritionType(moments, checkIns), [moments, checkIns]);
  const real = profile.dataPointsCurrent;
  const orientation = buildEarlyOrientationCopy(language, profile.archetype, real, profile.dataPointsNeeded);
  const confidence = (value: string) => {
    if (language === 'ar') return value === 'Signal' ? 'بداية ملاحظة' : value === 'Trend' ? 'أصبح أوضح' : value === 'Pattern' ? 'اكتشاف واضح' : value;
    if (language === 'de') return value === 'Signal' ? 'Erstes Signal' : value === 'Trend' ? 'Wird klarer' : value === 'Pattern' ? 'Klarer Zusammenhang' : value;
    if (language === 'fr') return value === 'Signal' ? 'Premier signal' : value === 'Trend' ? 'Se précise' : value === 'Pattern' ? 'Lien clair' : value;
    return value;
  };

  return <div className="max-w-3xl mx-auto pb-10">
    <section className="pt-5 sm:pt-9"><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.14em] text-[#6D765F]"><Activity className="w-4 h-4" />{t('yourData')}</p><h1 className="mt-3 text-5xl sm:text-7xl font-display font-black tracking-[-.04em] text-[#252824]">{t('patterns')}</h1><p className="mt-3 max-w-xl text-sm sm:text-base leading-relaxed text-[#706F68]">{intro[language]}</p></section>
    <section data-testid="early-personal-orientation" className="mt-8 rounded-[30px] bg-[#293D34] p-6 sm:p-7 text-white shadow-[0_18px_45px_rgba(41,61,52,.18)]"><div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3"><span data-testid="orientation-status" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.1em]"><Sparkles className="h-3.5 w-3.5 shrink-0" />{orientation.label}</span><span className="text-[11px] leading-4 text-white/60">{orientation.progress}</span></div><h2 className="mt-4 text-2xl sm:text-3xl font-display font-black" dir="auto">{orientation.title}</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75" dir="auto">{orientation.description}</p><div className="mt-5 h-2 overflow-hidden rounded-full bg-white/12" aria-label={orientation.progress}><div className="h-full rounded-full bg-[#F2A275] transition-all" style={{ width: `${profile.confidenceScore}%` }} /></div>{real === 0 && <button type="button" onClick={onOpenAddMoment} className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-black text-[#293D34]"><Plus className="h-4 w-4" />{t('add')}</button>}</section>

    {localizedRhythmShift && <section data-testid="meal-rhythm-shift-insight" className="mt-4 rounded-[30px] border border-[#E5E0D7] bg-white p-6 sm:p-7 text-[#292B27]"><div className="flex items-start gap-3"><span className="rounded-2xl bg-[#EEF2E9] p-2.5 text-[#526B48]"><Clock3 className="h-5 w-5" /></span><div><h2 className="text-xl sm:text-2xl font-display font-black" dir="auto">{localizedRhythmShift.title}</h2><p data-testid="meal-rhythm-shift-observation" className="mt-2 text-sm leading-relaxed text-[#5F625C]" dir="auto">{localizedRhythmShift.observation}</p><p className="mt-2 text-xs leading-relaxed text-[#8B887F]" dir="auto">{localizedRhythmShift.evidence}</p></div></div></section>}

    {mealVariety && <section data-testid="meal-variety-insight" className="mt-4 rounded-[30px] border border-[#E5E0D7] bg-white p-6 sm:p-7 text-[#292B27]"><div className="flex items-start gap-3"><span className="rounded-2xl bg-[#EEF2E9] p-2.5 text-[#526B48]"><Sparkles className="h-5 w-5" /></span><div><h2 className="text-xl sm:text-2xl font-display font-black" dir="auto">{varietyCopy[language].title}</h2><p data-testid="meal-variety-summary" className="mt-2 text-sm leading-relaxed text-[#5F625C]" dir="auto">{varietyCopy[language].body(mealVariety.distinctMealCount, mealVariety.mealCount)}</p><p className="mt-2 text-xs leading-relaxed text-[#8B887F]" dir="auto">{varietyCopy[language].note}</p></div></div></section>}

    {recurringMeals.length > 0 && <section data-testid="recurring-meals-insight" className="mt-4 rounded-[30px] border border-[#E5E0D7] bg-white p-6 sm:p-7 text-[#292B27]"><div className="flex items-start gap-3"><span className="rounded-2xl bg-[#F1ECE4] p-2.5 text-[#7A654D]"><Repeat2 className="h-5 w-5" /></span><div><h2 className="text-xl sm:text-2xl font-display font-black" dir="auto">{recurringCopy[language].title}</h2><p className="mt-1 text-sm leading-relaxed text-[#706F68]" dir="auto">{recurringCopy[language].description}</p></div></div><div className="mt-5 grid gap-2 sm:grid-cols-3">{recurringMeals.map(meal => <div data-testid="recurring-meal-item" key={`${meal.title}-${meal.latestCreatedAt}`} className="rounded-[20px] bg-[#F7F5F0] p-4"><p className="truncate text-sm font-black" dir="auto">{meal.title}</p><p className="mt-1 text-xs font-bold text-[#8A694A]" dir="auto">{recurringCopy[language].count(meal.count)}</p></div>)}</div></section>}

    <div className="mt-4 space-y-4">{insights.map((item) => { const localized = localizePatternInsight(item, language); return <article key={item.id} data-pattern-id={item.id} className="rounded-[30px] border border-[#E5E0D7] bg-white p-6 sm:p-7 text-[#292B27]"><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-[#F1ECE4] px-3 py-1 text-[10px] font-black uppercase tracking-[.1em] text-[#77736B]">{confidence(item.confidence)}</span><span className="text-[11px] text-[#969188]">{item.evidenceCount} {t('observations')}</span></div><h2 className="mt-4 text-2xl sm:text-3xl font-display font-black">{patternTitles[language][item.id] || item.title}</h2><p data-testid="pattern-evidence" className="mt-3 text-sm leading-relaxed text-[#706F68]" dir="auto">{item.id === 'learning' ? learningText[language] : localized.observation}</p>{item.id !== 'learning' && <div className="mt-5 rounded-[20px] bg-[#F7F5F0] p-4"><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.12em]"><FlaskConical className="h-4 w-4" />{t('tryWeek')}</p><p data-testid="pattern-experiment" className="mt-2 text-sm leading-relaxed text-[#66655F]" dir="auto">{localized.experiment}</p></div>}</article>; })}</div>
    <section className="mt-6 rounded-[30px] border border-[#E5E0D7] bg-white p-6"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.12em] text-[#7A654D]"><PawPrint className="h-4 w-4" />{rhythmLabel[language]}</div><div className="mt-4 grid grid-cols-2 gap-2">{getAnimalTypeNames(language).map(name => <div key={name} className="rounded-2xl bg-[#F7F5F0] px-3 py-3 text-xs font-bold text-[#555750]">{name}</div>)}</div></section>
    <section className="mt-7 flex items-center justify-between gap-4 rounded-[26px] bg-[#EFE9DE] p-5"><div><strong className="text-sm text-[#30322E]">{real} {t('realDataPoints')}</strong><p className="mt-1 text-xs text-[#7D7971]">{t('ordinaryDaysEnough')}</p></div><button onClick={onOpenCheckIn} className="shrink-0 rounded-full bg-[#252824] px-4 py-3 text-xs font-black text-white flex items-center gap-1.5"><Plus className="h-4 w-4" />{language === 'ar' ? 'أضف لحظة' : t('add')}</button></section>
  </div>;
};
