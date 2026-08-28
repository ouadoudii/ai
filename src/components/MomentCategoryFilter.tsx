import React from 'react';
import { FilterState, MomentCategory } from '../types';
import { MOMENT_LABELS, MOODS } from '../data/momentsData';
import { 
  Sunrise, 
  Sun, 
  Moon, 
  Apple, 
  Coffee, 
  Sparkles, 
  Compass, 
  Layers,
  Heart
} from 'lucide-react';

interface MomentCategoryFilterProps {
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  momentCounts: Record<string, number>;
  totalCount: number;
}

const ICONS_MAP: Record<string, React.ReactNode> = {
  breakfast: <Sunrise className="w-3.5 h-3.5" />,
  lunch: <Sun className="w-3.5 h-3.5" />,
  dinner: <Moon className="w-3.5 h-3.5" />,
  snack: <Apple className="w-3.5 h-3.5" />,
  coffee: <Coffee className="w-3.5 h-3.5" />,
  dessert: <Sparkles className="w-3.5 h-3.5" />,
  travel: <Compass className="w-3.5 h-3.5" />,
};

export const MomentCategoryFilter: React.FC<MomentCategoryFilterProps> = ({
  filterState,
  setFilterState,
  momentCounts,
  totalCount,
}) => {
  const categories: Array<{ key: MomentCategory | 'all'; label: string; icon: React.ReactNode }> = [
    { key: 'all', label: 'Alle Momente', icon: <Layers className="w-3.5 h-3.5" /> },
    { key: 'breakfast', label: MOMENT_LABELS.breakfast.label, icon: ICONS_MAP.breakfast },
    { key: 'lunch', label: MOMENT_LABELS.lunch.label, icon: ICONS_MAP.lunch },
    { key: 'dinner', label: MOMENT_LABELS.dinner.label, icon: ICONS_MAP.dinner },
    { key: 'snack', label: MOMENT_LABELS.snack.label, icon: ICONS_MAP.snack },
    { key: 'coffee', label: MOMENT_LABELS.coffee.label, icon: ICONS_MAP.coffee },
    { key: 'dessert', label: MOMENT_LABELS.dessert.label, icon: ICONS_MAP.dessert },
    { key: 'travel', label: MOMENT_LABELS.travel.label, icon: ICONS_MAP.travel },
  ];

  return (
    <div className="space-y-2.5">
      {/* Category Pills - Clean Horizontal Scroll */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5">
        {categories.map((cat) => {
          const isSelected = filterState.selectedCategory === cat.key;
          const count = cat.key === 'all' ? totalCount : momentCounts[cat.key] || 0;

          return (
            <button
              key={cat.key}
              id={`filter-cat-${cat.key}`}
              onClick={() =>
                setFilterState((prev) => ({
                  ...prev,
                  selectedCategory: cat.key,
                }))
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                isSelected
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-stone-100/90 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
              }`}
            >
              <span className={isSelected ? 'text-white' : 'text-stone-500'}>
                {cat.icon}
              </span>
              <span>{cat.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-medium ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-stone-200/70 text-stone-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary Quick Filter Pills: Mood & Favorites */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs pt-0.5">
        <span className="text-[11px] text-stone-400 shrink-0 font-medium pl-1">
          Gefühl:
        </span>
        
        <button
          onClick={() => setFilterState((prev) => ({ ...prev, selectedMood: 'all' }))}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors ${
            filterState.selectedMood === 'all'
              ? 'bg-stone-800 text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          Alle
        </button>

        {Object.entries(MOODS).map(([key, mood]) => {
          const isSelected = filterState.selectedMood === key;
          return (
            <button
              key={key}
              onClick={() =>
                setFilterState((prev) => ({
                  ...prev,
                  selectedMood: isSelected ? 'all' : (key as any),
                }))
              }
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-all ${
                isSelected
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-stone-100/80 text-stone-600 hover:bg-stone-200/70'
              }`}
            >
              <span>{mood.emoji}</span>
              <span>{mood.label}</span>
            </button>
          );
        })}

        {/* Favorites only filter */}
        <button
          onClick={() =>
            setFilterState((prev) => ({
              ...prev,
              onlyFavorites: !prev.onlyFavorites,
            }))
          }
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-all ${
            filterState.onlyFavorites
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-stone-100/80 text-stone-600 hover:bg-stone-200/70'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${filterState.onlyFavorites ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
          <span>Favoriten</span>
        </button>
      </div>
    </div>
  );
};

