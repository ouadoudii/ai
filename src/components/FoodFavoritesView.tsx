import React from 'react';
import { FoodMoment } from '../types';
import { MomentCard } from './MomentCard';
import { Bookmark, Sparkles, Plus } from 'lucide-react';

interface FoodFavoritesViewProps {
  favoriteMoments: FoodMoment[];
  onSelectMoment: (moment: FoodMoment) => void;
  onEditMoment: (moment: FoodMoment) => void;
  onDeleteMoment: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenAddModal: () => void;
}

export const FoodFavoritesView: React.FC<FoodFavoritesViewProps> = ({
  favoriteMoments,
  onSelectMoment,
  onEditMoment,
  onDeleteMoment,
  onToggleFavorite,
  onOpenAddModal,
}) => {
  if (favoriteMoments.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200/60">
          <Bookmark className="w-7 h-7 fill-amber-500 text-amber-500" />
        </div>
        <div className="max-w-md mx-auto space-y-1.5">
          <h3 className="font-display font-bold text-lg sm:text-xl text-stone-900">
            Noch keine Favoriten gespeichert
          </h3>
          <p className="text-xs text-stone-500">
            Tippe auf das Lesezeichen-Symbol bei jedem Moment, um deine besten kulinarischen Highlights hier zu sammeln.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Moment erstellen</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white border border-stone-200/80 shadow-xs rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Highlights & Empfehlungen</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-stone-900">
            Favoriten & Best-of Archiv ({favoriteMoments.length})
          </h2>
        </div>
      </div>

      {/* Grid of favorite cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {favoriteMoments.map((moment) => (
          <MomentCard
            key={moment.id}
            moment={moment}
            onSelect={onSelectMoment}
            onEdit={onEditMoment}
            onDelete={onDeleteMoment}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

    </div>
  );
};

