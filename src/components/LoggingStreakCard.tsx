import React from 'react';
import { BookOpen } from 'lucide-react';
import type { FoodMoment } from '../types';
import { useLanguage } from '../i18n';
import { getLoggedDayCount } from '../utils/loggingStreak';

interface Props { moments: FoodMoment[] }

const copy = {
  en: {
    title: 'Your journal, at your pace',
    unit: 'days with moments recorded',
    body: 'Each day you choose to record adds context. Days without entries are a normal part of life, too.',
  },
  de: {
    title: 'Dein Journal, in deinem Tempo',
    unit: 'Tage mit Einträgen',
    body: 'Jeder festgehaltene Tag ergänzt dein Bild. Tage ohne Eintrag gehören genauso zum Alltag.',
  },
  fr: {
    title: 'Ton journal, à ton rythme',
    unit: 'jours avec des moments notés',
    body: 'Chaque journée notée ajoute du contexte. Les jours sans entrée font aussi partie de la vie.',
  },
  ar: {
    title: 'سجلك على راحتك',
    unit: 'أيام فيها لحظات مسجّلة',
    body: 'كل يوم سجّلت فيه لحظة يضيف جزءاً من قصتك. والأيام بلا تسجيل عادية أيضاً.',
  },
} as const;

/**
 * Historical component name retained for import compatibility.
 * Visible UI intentionally contains no streaks, bests, reset threats or flame icon.
 */
export const LoggingStreakCard: React.FC<Props> = ({ moments }) => {
  const { language } = useLanguage();
  const days = React.useMemo(() => getLoggedDayCount(moments), [moments]);
  if (days < 2) return null;
  const text = copy[language as keyof typeof copy] || copy.ar;
  return (
    <section
      data-testid="journal-days-card"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="rounded-[28px] border border-[#E8DFD3] bg-[#FFFDF9] p-5 shadow-[0_12px_30px_rgba(68,52,36,.08)]"
      aria-label={text.title}
    >
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#E9F0E3] text-[#526B48]">
          <BookOpen className="h-7 w-7" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-xs font-black text-[#526B48]">{text.title}</h2>
          <p className="mt-1 text-xl font-display font-bold text-[#292C27]">
            <span data-testid="journal-days-count">{days}</span> {text.unit}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[#55564D]">{text.body}</p>
    </section>
  );
};
