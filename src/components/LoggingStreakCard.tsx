import React from 'react';
import { Flame } from 'lucide-react';
import type { FoodMoment } from '../types';
import { useLanguage } from '../i18n';
import { getMealLoggingStreak } from '../utils/loggingStreak';

interface Props { moments: FoodMoment[] }

const copy = {
  en: { title: 'Your logging rhythm', unit: 'days in a row', body: 'You have captured at least one meal on each of these consecutive days.' },
  de: { title: 'Dein Erfassungsrhythmus', unit: 'Tage in Folge', body: 'An jedem dieser aufeinanderfolgenden Tage hast du mindestens eine Mahlzeit festgehalten.' },
  fr: { title: 'Ton rythme de suivi', unit: 'jours de suite', body: 'Tu as noté au moins un repas pendant chacun de ces jours consécutifs.' },
  ar: { title: 'إيقاع تسجيلك', unit: 'أيام متتالية', body: 'سجّلت وجبة واحدة على الأقل في كل يوم من هذه الأيام المتتالية.' },
} as const;

export const LoggingStreakCard: React.FC<Props> = ({ moments }) => {
  const { language } = useLanguage();
  const streak = React.useMemo(() => getMealLoggingStreak(moments), [moments]);
  if (streak < 2) return null;
  const text = copy[language as keyof typeof copy] || copy.en;
  return <section data-testid="logging-streak-card" className="rounded-[28px] border border-[#E8DFD3] bg-[#FFFDF9] p-5 shadow-[0_12px_30px_rgba(68,52,36,.08)]" aria-label={text.title}>
    <div className="flex items-center gap-4">
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#FFF1CE] text-[#B87914]"><Flame className="h-7 w-7" aria-hidden="true"/></span>
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-wide text-[#718565]">{text.title}</p>
        <p className="mt-1 text-2xl font-display font-black text-[#292C27]"><span data-testid="logging-streak-count">{streak}</span> {text.unit}</p>
      </div>
    </div>
    <p className="mt-3 text-sm leading-relaxed text-[#77736B]">{text.body}</p>
  </section>;
};
