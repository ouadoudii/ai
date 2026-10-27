import React from 'react';
import { Heart, Sparkles } from 'lucide-react';
import {
  getOrCreateHeartNoteSeed,
  HEART_NOTE_OFFLINE_SEED,
  selectDailyHeartNote,
} from '../utils/dailyHeartNote';

interface DailyHeartNoteProps {
  dateKey: string;
}

/**
 * A quiet daily ritual. The seed is local to this installation; it is never
 * based on meals, mood, health data or other private journal content.
 */
export function DailyHeartNote({ dateKey }: DailyHeartNoteProps) {
  const [seed, setSeed] = React.useState(HEART_NOTE_OFFLINE_SEED);

  React.useEffect(() => {
    try {
      setSeed(getOrCreateHeartNoteSeed(window.localStorage));
    } catch {
      // Some privacy modes throw when even accessing window.localStorage.
      setSeed(HEART_NOTE_OFFLINE_SEED);
    }
  }, []);

  return (
    <aside
      data-testid="daily-heart-note"
      data-personalized={seed === HEART_NOTE_OFFLINE_SEED ? 'false' : 'true'}
      dir="rtl"
      aria-label="كلمة لقلبك اليوم"
      className="relative mt-6 overflow-hidden rounded-[30px] border border-[#E6D9C4] bg-[#FFF8EB] px-5 py-5 text-[#3E4839] shadow-[0_12px_34px_rgba(42,37,28,.12)] sm:px-7 sm:py-6"
    >
      <span aria-hidden="true" className="pointer-events-none absolute -left-8 -top-12 h-36 w-36 rounded-full border-[22px] border-[#D8BC8B]/20" />
      <div className="relative flex items-center gap-2 text-xs font-bold tracking-normal text-[#756044]">
        <Heart className="h-4 w-4" aria-hidden="true" />
        <span>كلمة لقلبك</span>
        <Sparkles className="h-4 w-4 text-[#AA8350]" aria-hidden="true" />
      </div>
      <blockquote data-testid="daily-heart-note-text" className="relative mt-3 font-display text-xl font-semibold leading-[1.9] text-[#354737] sm:text-2xl">
        {selectDailyHeartNote(seed, dateKey)}
      </blockquote>
      <p className="relative mt-2 text-xs leading-relaxed text-[#766C5C]">
        رسالة صغيرة ليومك، بلا استعجال.
      </p>
    </aside>
  );
}
