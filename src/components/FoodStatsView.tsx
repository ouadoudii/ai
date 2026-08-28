import React from 'react';
import { FoodMoment, MomentCategory } from '../types';
import { MOMENT_LABELS, MOODS } from '../data/momentsData';
import { 
  Star, 
  Utensils, 
  Heart, 
  Sparkles
} from 'lucide-react';

interface FoodStatsViewProps {
  moments: FoodMoment[];
  onSelectCategory: (category: MomentCategory) => void;
}

export const FoodStatsView: React.FC<FoodStatsViewProps> = ({
  moments,
  onSelectCategory,
}) => {
  // Compute analytics
  const total = moments.length;

  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    moments.forEach((m) => {
      counts[m.category] = (counts[m.category] || 0) + 1;
    });
    return counts;
  }, [moments]);

  const moodCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    moments.forEach((m) => {
      counts[m.mood] = (counts[m.mood] || 0) + 1;
    });
    return counts;
  }, [moments]);

  const avgRating = React.useMemo(() => {
    if (!total) return 0;
    const sum = moments.reduce((acc, m) => acc + m.rating, 0);
    return (sum / total).toFixed(1);
  }, [moments, total]);

  const homeVsOut = React.useMemo(() => {
    let home = 0;
    let restaurant = 0;
    moments.forEach((m) => {
      if (m.locationCategory === 'home' || m.location.toLowerCase().includes('zuhause') || m.tags.includes('HomeCooked')) {
        home++;
      } else {
        restaurant++;
      }
    });
    return { home, restaurant };
  }, [moments]);

  // Tag clouds
  const topTags = React.useMemo(() => {
    const counts: Record<string, number> = {};
    moments.forEach((m) => {
      m.tags.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [moments]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner Overview - Clean Modern Card Layout */}
      <div className="bg-white border border-stone-200/80 shadow-xs rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Statistiken & Übersicht</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-stone-900">
          Kulinarischer Rückblick
        </h2>
        <p className="text-xs text-stone-500 mt-1 max-w-xl">
          Visualisierte Metriken deiner erfassten Essens-Momente nach Mahlzeit-Labels, Wohlbefinden und Location.
        </p>

        {/* 4 Key Stats Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/70">
            <p className="text-3xl sm:text-4xl font-bold font-display text-stone-900">{total}</p>
            <p className="text-[11px] font-medium text-stone-500 mt-1">Momente erfasst</p>
          </div>

          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60">
            <div className="flex items-center gap-1.5">
              <p className="text-3xl sm:text-4xl font-bold font-display text-amber-600">{avgRating}</p>
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <p className="text-[11px] font-medium text-amber-700 mt-1">Ø Bewertung</p>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/70">
            <p className="text-3xl sm:text-4xl font-bold font-display text-stone-900">
              {total ? Math.round((homeVsOut.home / total) * 100) : 0}%
            </p>
            <p className="text-[11px] font-medium text-stone-500 mt-1">Selbst gekocht</p>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/70">
            <p className="text-3xl sm:text-4xl font-bold font-display text-stone-900">
              {total ? Math.round((homeVsOut.restaurant / total) * 100) : 0}%
            </p>
            <p className="text-[11px] font-medium text-stone-500 mt-1">Restaurants & Cafés</p>
          </div>
        </div>
      </div>

      {/* Grid: Moment Labels Distribution & Mood Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Moment.Label Distribution */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-display font-bold text-base text-stone-900 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-amber-600" />
              <span>Mahlzeiten-Kategorien</span>
            </h3>
            <span className="text-[11px] font-medium text-stone-400">Anzahl / Anteil</span>
          </div>

          <div className="space-y-3">
            {Object.entries(MOMENT_LABELS).map(([key, item]) => {
              const count = categoryCounts[key] || 0;
              const percent = total ? Math.round((count / total) * 100) : 0;

              return (
                <div 
                  key={key}
                  onClick={() => onSelectCategory(key as MomentCategory)}
                  className="group cursor-pointer hover:bg-stone-50 p-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-medium text-stone-800 mb-1">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>{item.label}</span>
                    </span>
                    <span className="text-stone-500 group-hover:text-stone-900 font-semibold text-[11px]">
                      {count} ({percent}%)
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Food Moods & Feeling Breakdown */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-display font-bold text-base text-stone-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Stimmung & Genuss-Gefühl</span>
            </h3>
            <span className="text-[11px] font-medium text-stone-400">Übersicht</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {Object.entries(MOODS).map(([key, mood]) => {
              const count = moodCounts[key] || 0;
              return (
                <div
                  key={key}
                  className="p-3 bg-stone-50 rounded-2xl border border-stone-200/70 flex items-center gap-3"
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <div>
                    <span className="font-semibold text-xs text-stone-800 block truncate">
                      {mood.label}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {count}x erfasst
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top Flavor Tags */}
          <div className="pt-3 border-t border-stone-100 space-y-2">
            <span className="text-[11px] font-semibold text-stone-500 block">
              Häufigste Tags & Geschmacksnoten
            </span>
            <div className="flex flex-wrap gap-1.5">
              {topTags.map(([tag, count]) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-stone-100 text-stone-700 text-xs font-medium rounded-lg flex items-center gap-1.5"
                >
                  <span>#{tag}</span>
                  <span className="text-[10px] text-amber-600 font-semibold">({count})</span>
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

