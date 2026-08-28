import React from 'react';
import { FoodMoment } from '../types';
import { MOMENT_LABELS, MOODS } from '../data/momentsData';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Star, 
  Flame, 
  Plus
} from 'lucide-react';

interface FoodCalendarViewProps {
  moments: FoodMoment[];
  onSelectMoment: (moment: FoodMoment) => void;
  onOpenAddModal: () => void;
}

export const FoodCalendarView: React.FC<FoodCalendarViewProps> = ({
  moments,
  onSelectMoment,
  onOpenAddModal,
}) => {
  // Group moments by date (sorted descending)
  const groupedMoments = React.useMemo(() => {
    const map = new Map<string, FoodMoment[]>();
    
    // Sort all moments by timestamp
    const sorted = [...moments].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`).getTime();
      const dateB = new Date(`${b.date}T${b.time}`).getTime();
      return dateB - dateA;
    });

    sorted.forEach((m) => {
      const list = map.get(m.date) || [];
      list.push(m);
      map.set(m.date, list);
    });

    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [moments]);

  const formatDayTitle = (dateStr: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      if (dateStr === today) return 'Heute';
      if (dateStr === yesterday) return 'Gestern';

      const [y, m, d] = dateStr.split('-');
      const date = new Date(Number(y), Number(m) - 1, Number(d));
      return date.toLocaleDateString('de-DE', {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-amber-600 block mb-1">
            Chronologisches Archiv
          </span>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-stone-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-600" />
            <span>Tagebuch & Chronologie</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Deine kulinarische Reise Tag für Tag geordnet nach Frühstück, Mittag- und Abendessen.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Eintrag erfassen</span>
        </button>
      </div>

      {/* Days Timeline Feed */}
      <div className="space-y-6">
        {groupedMoments.map(([dateKey, dayMoments]) => {
          const totalCalories = dayMoments.reduce((sum, m) => sum + (m.nutrition?.calories || 0), 0);

          return (
            <section
              key={dateKey}
              className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden"
            >
              {/* Day Header Bar */}
              <div className="px-5 py-3.5 bg-stone-50/80 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h3 className="font-display font-bold text-sm sm:text-base text-stone-800">
                    {formatDayTitle(dateKey)}
                  </h3>
                  <span className="text-xs text-stone-500">
                    ({dayMoments.length} {dayMoments.length === 1 ? 'Eintrag' : 'Einträge'})
                  </span>
                </div>

                {totalCalories > 0 && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
                    <Flame className="w-3.5 h-3.5 text-amber-600" />
                    <span>~{totalCalories} kcal</span>
                  </div>
                )}
              </div>

              {/* Day Moments List */}
              <div className="divide-y divide-stone-100">
                {dayMoments.map((moment) => {
                  const mood = MOODS[moment.mood] || MOODS.satisfied;
                  const catDef = MOMENT_LABELS[moment.category] || MOMENT_LABELS.lunch;

                  return (
                    <div
                      key={moment.id}
                      onClick={() => onSelectMoment(moment)}
                      className="p-4 hover:bg-stone-50 transition-colors cursor-pointer flex items-center gap-4 group"
                    >
                      {/* Thumbnail with Moment Label overlay */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                        <img
                          src={moment.imageUrl}
                          alt={moment.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Moment Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-900">
                            {moment.label || catDef.label}
                          </span>
                          <span className="text-xs text-stone-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-stone-400" />
                            {moment.time} Uhr
                          </span>
                          <span className="text-xs" title={mood.label}>{mood.emoji}</span>
                        </div>

                        <h4 className="font-display font-semibold text-sm sm:text-base text-stone-900 truncate group-hover:text-amber-600 transition-colors">
                          {moment.title}
                        </h4>

                        <div className="flex items-center gap-3 text-xs text-stone-500">
                          <span className="truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                            {moment.location || 'Zuhause'}
                          </span>
                          {moment.nutrition?.calories && (
                            <span className="shrink-0 flex items-center gap-0.5 text-stone-600">
                              <Flame className="w-3 h-3 text-amber-500" />
                              {moment.nutrition.calories} kcal
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Rating */}
                      <div className="flex items-center gap-1 text-amber-600 shrink-0 font-semibold text-sm">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{moment.rating}</span>
                      </div>

                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

    </div>
  );
};
