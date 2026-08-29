import React from 'react';
import { Moon, Sparkles, Utensils } from 'lucide-react';
import { DailyCheckIn, FoodMoment } from '../types';
import { getLocalDateKey } from '../utils/dateKey';

interface TodaySnapshotProps {
  moments: FoodMoment[];
  checkIns: DailyCheckIn[];
  onOpenCheckIn: () => void;
}

export const TodaySnapshot: React.FC<TodaySnapshotProps> = ({ moments, checkIns, onOpenCheckIn }) => {
  const todayKey = getLocalDateKey();
  const todayMoments = moments.filter((moment) => moment.date === todayKey);
  const todayCheckIns = checkIns.filter((checkIn) => checkIn.date === todayKey);
  const latestCheckIn = todayCheckIns[0];
  const latestSleep = todayCheckIns.find((checkIn) => checkIn.sleep)?.sleep;

  return (
    <section aria-labelledby="today-snapshot-title" className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-500">Tagesblick</p>
          <h2 id="today-snapshot-title" className="font-display text-lg font-bold text-stone-900">Heute auf einen Blick</h2>
        </div>
        <button
          type="button"
          onClick={onOpenCheckIn}
          className="rounded-lg px-2 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          Check-in
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-xs">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Utensils className="h-4 w-4" aria-hidden="true" />
          </div>
          <p className="text-xl font-display font-bold text-stone-900">{todayMoments.length}</p>
          <p className="mt-0.5 text-[11px] font-medium text-stone-500">Momente</p>
        </div>

        <div className="rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-xs">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </div>
          <p className="text-xl font-display font-bold text-stone-900">
            {latestCheckIn ? `${latestCheckIn.wellbeing.energyLevel}/5` : '—'}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-stone-500">Energie</p>
        </div>

        <div className="rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-xs">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <Moon className="h-4 w-4" aria-hidden="true" />
          </div>
          <p className="text-xl font-display font-bold text-stone-900">
            {latestSleep ? `${latestSleep.durationHours}h` : '—'}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-stone-500">Schlaf</p>
        </div>
      </div>
    </section>
  );
};
