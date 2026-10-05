import React from 'react';
import { Repeat2 } from 'lucide-react';
import type { FoodMoment } from '../types';
import { useLanguage } from '../i18n';
import { deriveMealFrequencyInsight } from '../utils/mealFrequencyInsight';
import { getLocalDateKey } from '../utils/dateKey';
import { RecurringSocialCompanionCard } from './RecurringSocialCompanionCard';

interface Props { moments: FoodMoment[] }

const copy = {
  en: { title: 'A rhythm you repeated', body: (meal:string,count:number) => `${meal} appeared ${count} times in your last 7 days.` },
  de: { title: 'Ein Rhythmus, der sich wiederholt', body: (meal:string,count:number) => `${meal} hast du in den letzten 7 Tagen ${count}× festgehalten.` },
  fr: { title: 'Un rythme qui se répète', body: (meal:string,count:number) => `${meal} apparaît ${count} fois dans tes 7 derniers jours.` },
  ar: { title: 'إيقاع تكرر عندك', body: (meal:string,count:number) => `سجّلت ${meal} ${count} مرات خلال آخر 7 أيام.` },
} as const;

export const MealFrequencyInsightCard: React.FC<Props> = ({ moments }) => {
  const { language } = useLanguage();
  const insight = React.useMemo(() => deriveMealFrequencyInsight(moments, getLocalDateKey()), [moments]);
  const text = copy[language as keyof typeof copy] || copy.en;
  return <>
    {insight && <section data-testid="meal-frequency-insight" className="mt-4 rounded-[28px] border border-[#E8DFD3] bg-[#FFFDF9] p-5 shadow-[0_12px_30px_rgba(68,52,36,.08)]" aria-label={text.title}>
      <div className="flex items-center gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#E9F0D8] text-[#64823D]"><Repeat2 className="h-6 w-6" aria-hidden="true"/></span>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-[#718565]">{text.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-[#5F625C]">{text.body(insight.title, insight.count)}</p>
        </div>
      </div>
    </section>}
    <RecurringSocialCompanionCard moments={moments}/>
  </>;
};
