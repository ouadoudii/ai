import React from 'react';
import { UsersRound } from 'lucide-react';
import type { FoodMoment, MomentCategory } from '../types';
import { useLanguage } from '../i18n';
import { deriveRecurringSocialCompanion } from '../recurringSocialCompanion';

interface Props { moments: FoodMoment[] }

const categories: MomentCategory[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const copy = {
  en: { title: 'A familiar shared moment', body: (name:string,count:number) => `You logged meals with ${name} ${count} times in this part of your day.` },
  de: { title: 'Ein vertrauter gemeinsamer Moment', body: (name:string,count:number) => `Du hast in diesem Teil deines Tages ${count}× Mahlzeiten mit ${name} festgehalten.` },
  fr: { title: 'Un moment partagé familier', body: (name:string,count:number) => `Tu as noté ${count} repas avec ${name} dans ce moment de ta journée.` },
  ar: { title: 'لحظة مشتركة مألوفة', body: (name:string,count:number) => `سجّلت ${count} وجبات مع ${name} في هذا الجزء من يومك.` },
} as const;

export const RecurringSocialCompanionCard: React.FC<Props> = ({ moments }) => {
  const { language } = useLanguage();
  const insight = React.useMemo(() => categories
    .map(category => deriveRecurringSocialCompanion(moments, category))
    .filter(Boolean)
    .sort((a, b) => (b?.count || 0) - (a?.count || 0))[0] || null, [moments]);
  if (!insight) return null;
  const text = copy[language as keyof typeof copy] || copy.en;
  return <section data-testid="recurring-social-companion-insight" className="mt-4 rounded-[28px] border border-[#E8DFD3] bg-[#FFFDF9] p-5 shadow-[0_12px_30px_rgba(68,52,36,.08)]" aria-label={text.title}>
    <div className="flex items-center gap-4">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#EEE9F7] text-[#7565B0]"><UsersRound className="h-6 w-6" aria-hidden="true"/></span>
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-wide text-[#7565B0]">{text.title}</p>
        <p className="mt-1 text-sm leading-relaxed text-[#5F625C]">{text.body(insight.companion, insight.count)}</p>
      </div>
    </div>
  </section>;
};
