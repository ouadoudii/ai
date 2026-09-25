import React from 'react';
import { Activity, FlaskConical, Plus, PawPrint, Sparkles } from 'lucide-react';
import { FoodMoment, DailyCheckIn } from '../types';
import { buildPatternInsights } from '../utils/patternInsights';
import { analyzeNutritionType } from '../utils/nutritionTypeEngine';
import { buildEarlyOrientationCopy, getAnimalTypeNames } from '../utils/earlyOrientation';
import { useLanguage, type AppLanguage } from '../i18n';

interface Props { moments: FoodMoment[]; checkIns: DailyCheckIn[]; onOpenCheckIn: () => void; onOpenAddMoment: () => void; }

const intro: Record<AppLanguage, string> = {
  ar: 'كل لحظة تضيف جزءاً من الصورة. عندما يتكرر شيء مفيد، ستجده هنا — ببساطة ومن دون أحكام.',
  de: 'Jeder Moment ergänzt ein Stück des Bildes. Wenn sich etwas Hilfreiches wiederholt, findest du es hier — einfach und ohne zu urteilen.',
  fr: 'Chaque moment complète ton image. Quand un signal utile se répète, tu le trouveras ici — simplement et sans jugement.',
  en: 'Every moment adds a piece to the picture. When something useful repeats, you’ll find it here — simply and without judgment.',
};
const rhythmLabel: Record<AppLanguage, string> = { ar: 'إيقاعك الشخصي', de: 'Dein persönlicher Rhythmus', fr: 'Ton rythme personnel', en: 'Your personal rhythm' };
export const patternTitles: Record<AppLanguage, Record<string, string>> = {
  de: { 'sleep-energy': 'Dein Schlaf und deine Tagesenergie', 'pace-energy': 'Esstempo und dein Gefühl danach', 'lunch-rhythm': 'Mittagszeit und dein Tagesrhythmus', 'late-lunch-snacking': 'Spätes Mittagessen und Snacks am Abend', 'distraction-fullness': 'Aufmerksamkeit beim Essen und Sattheit', learning: 'Wir lernen dich kennen' },
  en: { 'sleep-energy': 'Sleep ↔ energy', 'pace-energy': 'Eating pace ↔ how you feel', 'lunch-rhythm': 'Lunch ↔ daily rhythm', 'late-lunch-snacking': 'Late lunch ↔ evening snacking', 'distraction-fullness': 'Distraction ↔ fullness', learning: 'We’re getting to know you' },
  fr: { 'sleep-energy': 'Ton sommeil et ton énergie', 'pace-energy': 'Ton rythme alimentaire et ton ressenti', 'lunch-rhythm': 'Le déjeuner et ton rythme quotidien', 'late-lunch-snacking': 'Déjeuner tardif et grignotage le soir', 'distraction-fullness': 'L’attention pendant le repas et la satiété', learning: 'Nous apprenons à te connaître' },
  ar: { 'sleep-energy': 'نومك وطاقة يومك', 'pace-energy': 'سرعة الأكل وشعورك بعده', 'lunch-rhythm': 'موعد الغداء وإيقاع يومك', 'late-lunch-snacking': 'الغداء المتأخر والوجبات الخفيفة مساءً', 'distraction-fullness': 'التركيز أثناء الأكل والشبع', learning: 'نحن نتعرّف عليك' },
};
const learningText: Record<AppLanguage, string> = {
  ar: 'البداية موجودة. أضف لحظات أخرى وسنُحدّث توجّهك ونربط النقاط من أجلك.',
  de: 'Der Anfang ist da. Mit jedem weiteren Moment aktualisieren wir deine Orientierung und machen Zusammenhänge sichtbarer.',
  fr: 'Le début est là. Chaque nouveau moment affine ton orientation et rend les liens plus visibles.',
  en: 'The start is here. Every new moment refines your orientation and makes connections clearer.',
};
const repeatedText: Record<AppLanguage, string> = {
  ar: 'لاحظنا هذا أكثر من مرة في لحظاتك. قد يكون جزءاً مهماً من إيقاعك الشخصي.',
  de: 'Das ist uns in deinen Momenten mehr als einmal aufgefallen. Es könnte ein wichtiger Teil deines persönlichen Rhythmus sein.',
  fr: 'Nous l’avons remarqué plusieurs fois dans tes moments. Cela pourrait faire partie de ton rythme personnel.',
  en: 'We noticed this more than once in your moments. It may be an important part of your personal rhythm.',
};
const experimentText: Record<AppLanguage, string> = {
  ar: 'إذا أحببت، جرّب تغييراً صغيراً في موقف مشابه ولاحظ الفرق. لا نجاح ولا فشل — مجرد اكتشاف.',
  de: 'Wenn du möchtest, probiere in einer ähnlichen Situation eine kleine Veränderung aus und beobachte den Unterschied. Kein Erfolg oder Misserfolg — nur eine Entdeckung.',
  fr: 'Si tu veux, essaie un petit changement dans une situation similaire et observe la différence. Ni réussite ni échec — seulement une découverte.',
  en: 'If you like, try one small change in a similar situation and notice the difference. No success or failure — just discovery.',
};

export const NutritionTypeAnalysisView: React.FC<Props> = ({ moments, checkIns, onOpenCheckIn, onOpenAddMoment }) => {
  const { language, t } = useLanguage();
  const insights = React.useMemo(() => buildPatternInsights(moments, checkIns), [moments, checkIns]);
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

    <section data-testid="early-personal-orientation" className="mt-8 rounded-[30px] bg-[#293D34] p-6 sm:p-7 text-white shadow-[0_18px_45px_rgba(41,61,52,.18)]">
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3"><span data-testid="orientation-status" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.1em]"><Sparkles className="h-3.5 w-3.5 shrink-0" />{orientation.label}</span><span className="text-[11px] leading-4 text-white/60">{orientation.progress}</span></div>
      <h2 className="mt-4 text-2xl sm:text-3xl font-display font-black" dir="auto">{orientation.title}</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75" dir="auto">{orientation.description}</p>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/12" aria-label={orientation.progress}><div className="h-full rounded-full bg-[#F2A275] transition-all" style={{ width: `${profile.confidenceScore}%` }} /></div>
      {real === 0 && <button type="button" onClick={onOpenAddMoment} className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-black text-[#293D34]"><Plus className="h-4 w-4" />{t('add')}</button>}
    </section>

    <div className="mt-4 space-y-4">{insights.map((item) => <article key={item.id} className="rounded-[30px] border border-[#E5E0D7] bg-white p-6 sm:p-7 text-[#292B27]">
      <div className="flex items-center justify-between gap-3"><span className="rounded-full bg-[#F1ECE4] px-3 py-1 text-[10px] font-black uppercase tracking-[.1em] text-[#77736B]">{confidence(item.confidence)}</span><span className="text-[11px] text-[#969188]">{item.evidenceCount} {t('observations')}</span></div>
      <h2 className="mt-4 text-2xl sm:text-3xl font-display font-black">{patternTitles[language][item.id] || item.title}</h2><p className="mt-3 text-sm leading-relaxed text-[#706F68]">{item.id === 'learning' ? learningText[language] : repeatedText[language]}</p>
      {item.id !== 'learning' && <div className="mt-5 rounded-[20px] bg-[#F7F5F0] p-4"><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.12em]"><FlaskConical className="h-4 w-4" />{t('tryWeek')}</p><p className="mt-2 text-sm leading-relaxed text-[#66655F]">{experimentText[language]}</p></div>}
    </article>)}</div>

    <section className="mt-6 rounded-[30px] border border-[#E5E0D7] bg-white p-6"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.12em] text-[#7A654D]"><PawPrint className="h-4 w-4" />{rhythmLabel[language]}</div><div className="mt-4 grid grid-cols-2 gap-2">{getAnimalTypeNames(language).map(name => <div key={name} className="rounded-2xl bg-[#F7F5F0] px-3 py-3 text-xs font-bold text-[#555750]">{name}</div>)}</div></section>
    <section className="mt-7 flex items-center justify-between gap-4 rounded-[26px] bg-[#EFE9DE] p-5"><div><strong className="text-sm text-[#30322E]">{real} {t('realDataPoints')}</strong><p className="mt-1 text-xs text-[#7D7971]">{t('ordinaryDaysEnough')}</p></div><button onClick={onOpenCheckIn} className="shrink-0 rounded-full bg-[#252824] px-4 py-3 text-xs font-black text-white flex items-center gap-1.5"><Plus className="h-4 w-4" />{language === 'ar' ? 'أضف لحظة' : t('add')}</button></section>
  </div>;
};