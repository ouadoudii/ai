import React from 'react';
import type { FoodMoment } from '../types';
import { useLanguage } from '../i18n';
import { getLocalDateKey } from '../utils/dateKey';
import { deriveMealDayCoverage } from '../utils/mealDayCoverage';

type Props = { moments: FoodMoment[]; referenceDate?: string };

const copy = {
  en: { eyebrow: 'Your week', title: (days: number) => `${days} of the last 7 days are represented`, body: 'Your journal is starting to show more of your real rhythm. No streak needed — each day you capture adds context.', recorded: 'A moment was recorded', unrecorded: 'No entry — taking a break is okay' },
  de: { eyebrow: 'Deine Woche', title: (days: number) => `${days} der letzten 7 Tage sind erfasst`, body: 'Dein Journal zeigt immer mehr von deinem echten Rhythmus. Kein Streak nötig — jeder erfasste Tag gibt mehr Kontext.', recorded: 'Eine Erinnerung festgehalten', unrecorded: 'Kein Eintrag — eine Pause ist in Ordnung' },
  fr: { eyebrow: 'Ta semaine', title: (days: number) => `${days} des 7 derniers jours sont représentés`, body: 'Ton journal montre de mieux en mieux ton rythme réel. Pas besoin de série — chaque journée notée ajoute du contexte.', recorded: 'Un moment noté', unrecorded: 'Aucune note — une pause est normale' },
  ar: { eyebrow: 'أسبوعك', title: (days: number) => `سجّلت لحظات في ${days} من آخر 7 أيام`, body: 'كل لحظة تسجّلها تساعدك على فهم يومك. والأيام التي لم تسجّل فيها طبيعية أيضاً.', recorded: 'سجّلت لحظة', unrecorded: 'لا يوجد تسجيل، وهذا طبيعي' },
} as const;

export const MealDayCoverageCard: React.FC<Props> = ({ moments, referenceDate }) => {
  const { language } = useLanguage();
  const coverage = deriveMealDayCoverage(moments, referenceDate || getLocalDateKey());
  if (!coverage) return null;
  const c = copy[language as keyof typeof copy] || copy.en;
  const locale = language === 'ar' ? 'ar-MA' : language === 'de' ? 'de-DE' : language === 'fr' ? 'fr-FR' : 'en-US';
  const dayFormat = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
  return <section data-testid="meal-day-coverage" dir={language === 'ar' ? 'rtl' : undefined} className="mt-4 rounded-[26px] border border-[#E5DED2] bg-[#F8F4EC] p-5 text-start">
    <p className="text-[11px] font-black uppercase tracking-[.14em] text-[#526B48]">{c.eyebrow}</p>
    <h3 className="mt-2 text-lg font-black text-[#30332E]">{c.title(coverage.days)}</h3>
    <p className="mt-2 text-sm leading-6 text-[#5E5A52]">{c.body}</p>
    <div role="list" aria-label={`${coverage.days}/${coverage.windowDays}`} className="mt-4 grid grid-cols-7 gap-1.5">
      {coverage.dates.map(({ date, logged }) => <div key={date} role="listitem" data-testid="meal-day-mark" data-date={date} data-logged={String(logged)} className="min-w-0">
        <time dateTime={date} aria-label={`${dayFormat.format(new Date(`${date}T12:00:00Z`))}: ${logged ? c.recorded : c.unrecorded}`} className="flex min-w-0 flex-col items-center gap-1.5">
          <span aria-hidden="true" className={`h-2.5 w-full rounded-full ${logged ? 'bg-[#526B48]' : 'bg-[#DDD7CC]'}`} />
          <span aria-hidden="true" className="text-[10px] font-medium text-[#5E5A52]">{new Date(`${date}T12:00:00Z`).getUTCDate()}</span>
        </time>
      </div>)}
    </div>
  </section>;
};
