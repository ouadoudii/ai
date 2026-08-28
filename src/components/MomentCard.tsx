import React from 'react';
import { 
  FoodMoment 
} from '../types';
import { MOMENT_LABELS, MOODS } from '../data/momentsData';
import { 
  MapPin, 
  Clock, 
  Star, 
  Bookmark, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Flame
} from 'lucide-react';

interface MomentCardProps {
  moment: FoodMoment;
  onSelect: (moment: FoodMoment) => void;
  onEdit: (moment: FoodMoment) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const MomentCard: React.FC<MomentCardProps> = ({
  moment,
  onSelect,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const categoryDef = MOMENT_LABELS[moment.category] || MOMENT_LABELS.lunch;
  const moodDef = MOODS[moment.mood] || MOODS.satisfied;

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // Format date readable (e.g. "14. Juni • Rom")
  const dateFormatted = React.useMemo(() => {
    try {
      const parts = moment.date.split('-');
      if (parts.length === 3) {
        const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
        const mIdx = parseInt(parts[1], 10) - 1;
        return `${parts[2]}. ${monthNames[mIdx] || parts[1]}`;
      }
      return moment.date;
    } catch {
      return moment.date;
    }
  }, [moment.date]);

  return (
    <article 
      id={`moment-card-${moment.id}`}
      className="group relative bg-white rounded-2xl border border-stone-200/80 hover:border-amber-300 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
    >
      {/* Card Header & Media */}
      <div>
        {/* Top Image Container */}
        <div 
          onClick={() => onSelect(moment)}
          className="relative aspect-4/3 sm:aspect-16/10 w-full overflow-hidden cursor-pointer bg-stone-100"
        >
          <img
            src={moment.imageUrl}
            alt={moment.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          />

          {/* Gentle Subtle Overlay for Bottom Text Contrast */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Top Floating Badge: Category */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/95 text-stone-800 shadow-xs backdrop-blur-xs">
              {moment.label || categoryDef.label}
            </span>
          </div>

          {/* Top Right Action: Favorite Bookmark Button */}
          <button
            id={`btn-fav-${moment.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(moment.id);
            }}
            aria-label="Als Favorit markieren"
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all active:scale-90 ${
              moment.isFavorite
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-black/40 text-white hover:bg-black/60'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${moment.isFavorite ? 'fill-white' : ''}`} />
          </button>

          {/* Bottom of Image: Date, Location & Mood Pill */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-1.5 text-stone-100 font-medium drop-shadow-xs truncate pr-2">
              <span>{dateFormatted}</span>
              <span>•</span>
              <span className="truncate">{moment.location || 'Zuhause'}</span>
            </div>

            {/* Mood Emoji Badge */}
            <div 
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/90 text-stone-800 text-xs font-medium shrink-0 shadow-xs"
              title={`Gefühl: ${moodDef.label}`}
            >
              <span>{moodDef.emoji}</span>
              <span className="hidden xs:inline">{moodDef.label}</span>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-2">
          
          {/* Star Rating & Calories/Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < moment.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                  }`}
                />
              ))}
            </div>

            {moment.nutrition?.calories ? (
              <span className="text-xs text-stone-500 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-500" />
                {moment.nutrition.calories} kcal
              </span>
            ) : moment.price ? (
              <span className="text-xs font-medium text-stone-600">
                {moment.price}
              </span>
            ) : null}
          </div>

          {/* Dish Title */}
          <h3 
            onClick={() => onSelect(moment)}
            className="font-display font-semibold text-base sm:text-lg leading-snug text-stone-900 cursor-pointer line-clamp-2 group-hover:text-amber-600 transition-colors"
          >
            {moment.title}
          </h3>

          {/* Coach Feedback Box */}
          {moment.coachFeedback ? (
            <div 
              onClick={() => onSelect(moment)}
              className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs cursor-pointer hover:bg-amber-100/60 transition-colors space-y-0.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-900 flex items-center gap-1 text-[11px]">
                  <span>💡</span>
                  <span>{moment.coachFeedback.title}</span>
                </span>
                <span className="text-[10px] font-medium text-amber-800 bg-white/80 px-1.5 py-0.2 rounded-md">
                  {moment.coachFeedback.badge}
                </span>
              </div>
              <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                {moment.coachFeedback.message}
              </p>
            </div>
          ) : moment.notes ? (
            <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed italic">
              "{moment.notes}"
            </p>
          ) : null}

          {/* Hunger & Fullness Micro Indicator */}
          {(moment.hungerLevel !== undefined || moment.fullnessLevel !== undefined) && (
            <div className="flex items-center gap-3 text-[11px] text-stone-500 pt-0.5">
              <span>Hunger: <strong className="text-stone-700">{moment.hungerLevel || 3}/5</strong></span>
              <span>•</span>
              <span>Sättigung: <strong className="text-stone-700">{moment.fullnessLevel || 4}/5</strong></span>
              {moment.eatingPace && (
                <>
                  <span>•</span>
                  <span className="capitalize">{moment.eatingPace === 'slow' ? 'Langsam' : moment.eatingPace === 'rushed' ? 'Gehetzt' : 'Normal'}</span>
                </>
              )}
            </div>
          )}

          {/* Tags Chips */}
          {moment.tags && moment.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {moment.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-stone-100 text-stone-600 border border-stone-200/60"
                >
                  #{tag}
                </span>
              ))}
              {moment.tags.length > 3 && (
                <span className="text-[11px] text-stone-400 self-center">
                  +{moment.tags.length - 3}
                </span>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-4 py-2.5 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between text-xs">
        <span className="text-stone-500 text-xs">
          {moment.time} Uhr
        </span>

        {/* Action Menu */}
        <div className="flex items-center gap-1" ref={menuRef}>
          <button
            id={`btn-open-detail-${moment.id}`}
            onClick={() => onSelect(moment)}
            className="px-2.5 py-1 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors shadow-2xs"
          >
            Details
          </button>

          <div className="relative">
            <button
              id={`btn-menu-${moment.id}`}
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-200/60 transition-colors"
              aria-label="Optionen"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {/* Popup Context Menu */}
            {showMenu && (
              <div className="absolute right-0 bottom-full mb-1 w-36 bg-white rounded-xl shadow-lg border border-stone-200 py-1 z-20 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(moment);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-stone-700 hover:bg-stone-100 flex items-center gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                  <span>Bearbeiten</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(moment.id);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Löschen</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </article>
  );
};

