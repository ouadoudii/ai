import React from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Calendar, 
  Star, 
  Bookmark, 
  Edit3, 
  Trash2, 
  Share2, 
  Flame, 
  Sparkles,
  Check
} from 'lucide-react';
import { FoodMoment } from '../types';
import { MOMENT_LABELS, MOODS } from '../data/momentsData';

interface MomentDetailModalProps {
  moment: FoodMoment | null;
  onClose: () => void;
  onEdit: (moment: FoodMoment) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const MomentDetailModal: React.FC<MomentDetailModalProps> = ({
  moment,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!moment) return null;

  const categoryDef = MOMENT_LABELS[moment.category] || MOMENT_LABELS.lunch;
  const moodDef = MOODS[moment.mood] || MOODS.satisfied;

  const handleShare = () => {
    const text = `🍽️ Food Moment: ${moment.title} (${moment.label}) am ${moment.date} um ${moment.time} Uhr bei ${moment.location}. Bewertung: ${moment.rating}/5 ⭐`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      
      <div className="w-full max-w-xl bg-white text-stone-900 rounded-3xl shadow-xl border border-stone-200/80 max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Hero Image with Floating Overlays */}
        <div className="relative aspect-16/10 sm:aspect-16/9 w-full bg-stone-100 shrink-0">
          <img
            src={moment.imageUrl}
            alt={moment.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-black/30 pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Moment Label Badge */}
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              {moment.label || categoryDef.label}
            </span>
          </div>

          {/* Bottom Title & Location on Image */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 text-xs text-stone-200 mb-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {moment.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {moment.time} Uhr
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold leading-tight">
              {moment.title}
            </h1>
          </div>
        </div>

        {/* Scrollable Details Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 no-scrollbar">
          
          {/* Coach Feedback Section */}
          {moment.coachFeedback && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Coach-Feedback: {moment.coachFeedback.title}</span>
                </span>
                <span className="text-[11px] font-semibold bg-white text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200 shadow-2xs">
                  {moment.coachFeedback.badge}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                {moment.coachFeedback.message}
              </p>
            </div>
          )}

          {/* Quick Info Bar (Location, Rating, Mood, Calories) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5 tracking-wider">
                Ort
              </span>
              <div className="flex items-center gap-1 text-xs font-semibold text-stone-800 truncate">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">{moment.location || 'Zuhause'}</span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5 tracking-wider">
                Bewertung
              </span>
              <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{moment.rating} / 5</span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5 tracking-wider">
                Gefühl
              </span>
              <div className="flex items-center gap-1 text-xs font-semibold text-stone-800 truncate">
                <span>{moodDef.emoji}</span>
                <span className="truncate">{moodDef.label}</span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5 tracking-wider">
                Nährwerte
              </span>
              <div className="flex items-center gap-1 text-xs font-semibold text-stone-800 truncate">
                <Flame className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{moment.nutrition?.calories ? `${moment.nutrition.calories} kcal` : moment.price || 'Moment'}</span>
              </div>
            </div>

          </div>

          {/* Mindful Eating Breakdown (Hunger, Fullness, Pace, Distraction, Energy) */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <span className="text-xs font-semibold text-stone-700 block">
              Achtsames Essen: Hunger, Sättigung & Körpergefühl
            </span>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="flex justify-between text-stone-600 mb-1">
                  <span>Hunger davor:</span>
                  <span className="font-semibold text-amber-600">{moment.hungerLevel || 3}/5</span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full" 
                    style={{ width: `${((moment.hungerLevel || 3) / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-stone-600 mb-1">
                  <span>Sättigung danach:</span>
                  <span className="font-semibold text-emerald-600">{moment.fullnessLevel || 4}/5</span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full" 
                    style={{ width: `${((moment.fullnessLevel || 4) / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Eating Pace & Distraction Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-200/60 text-xs">
              {moment.eatingPace && (
                <span className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 font-medium">
                  ⏱️ Tempo: {moment.eatingPace === 'slow' ? 'In Ruhe / Langsam' : moment.eatingPace === 'rushed' ? 'Gehetzt' : 'Normal'}
                </span>
              )}
              {moment.distraction && (
                <span className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 font-medium">
                  🧘 Fokus: {moment.distraction === 'mindful' ? 'Ohne Ablenkung' : moment.distraction === 'screen' ? 'Mit Smartphone/TV' : moment.distraction === 'work' ? 'Beim Arbeiten' : 'In Gesellschaft'}
                </span>
              )}
              {moment.energyAfter && (
                <span className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 font-medium">
                  ⚡ Energie: {moment.energyAfter === 'energized' ? 'Voller Energie' : moment.energyAfter === 'heavy' ? 'Schwer / Food-Koma' : moment.energyAfter === 'sluggish' ? 'Träge' : 'Ausgeglichen'}
                </span>
              )}
            </div>
          </div>

          {/* Tags */}
          {moment.tags && moment.tags.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-stone-500 block">
                Tags & Attribute
              </span>
              <div className="flex flex-wrap gap-1.5">
                {moment.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Nutrition Detailed Pills */}
          {moment.nutrition && (moment.nutrition.protein || moment.nutrition.carbs || moment.nutrition.fat) && (
            <div className="flex items-center gap-3 text-xs bg-stone-100/80 p-3 rounded-xl text-stone-700">
              {moment.nutrition.protein && <span>🥩 {moment.nutrition.protein}g Protein</span>}
              {moment.nutrition.carbs && <span>🥖 {moment.nutrition.carbs}g Carbs</span>}
              {moment.nutrition.fat && <span>🥑 {moment.nutrition.fat}g Fett</span>}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-stone-200/80 bg-stone-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(moment.id)}
              className={`p-2 rounded-xl border transition-all ${
                moment.isFavorite
                  ? 'bg-rose-50 border-rose-300 text-rose-600'
                  : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900'
              }`}
              title="Favorit"
            >
              <Bookmark className={`w-4 h-4 ${moment.isFavorite ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-200 text-stone-700 text-xs font-medium rounded-xl hover:bg-stone-100 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">Kopiert!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Teilen</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(moment);
              }}
              className="flex items-center gap-1 px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold rounded-xl transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Bearbeiten</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onDelete(moment.id);
              }}
              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Löschen"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

