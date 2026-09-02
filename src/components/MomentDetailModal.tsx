import React from 'react';
import { Bookmark, Calendar, Check, Clock, Edit3, Flame, MapPin, Share2, Trash2, X } from 'lucide-react';
import { FoodMoment } from '../types';

interface MomentDetailModalProps {
  moment: FoodMoment | null;
  onClose: () => void;
  onEdit: (moment: FoodMoment) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

const categoryLabel: Record<string, string> = {
  breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack', coffee: 'Coffee', dessert: 'Dessert', drinks: 'Drinks', travel: 'Travel',
};
const moodLabel: Record<string, string> = {
  energized: 'Energized', satisfied: 'Satisfied', light: 'Light', indulgent: 'Indulgent', comfort: 'Comforted', joyful: 'Joyful',
};
const paceLabel: Record<string, string> = { slow: 'Slow', moderate: 'Moderate', rushed: 'Rushed' };
const focusLabel: Record<string, string> = { mindful: 'Undistracted', screen: 'Screen', work: 'Working', social: 'Social' };
const energyLabel: Record<string, string> = { energized: 'Energized', neutral: 'Balanced', sluggish: 'Sluggish', heavy: 'Heavy' };

export const MomentDetailModal: React.FC<MomentDetailModalProps> = ({ moment, onClose, onEdit, onDelete, onToggleFavorite }) => {
  const [copied, setCopied] = React.useState(false);
  if (!moment) return null;

  const share = () => {
    const text = `${moment.title} · ${categoryLabel[moment.category] || 'Meal'} · ${moment.date} ${moment.time}`;
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
    <section className="w-full max-w-xl max-h-[92vh] overflow-hidden rounded-[30px] bg-[#F7F5F0] shadow-2xl flex flex-col" role="dialog" aria-modal="true">
      <div className="relative aspect-[16/9] bg-[#EAE6DE] shrink-0">
        {moment.imageUrl && <img src={moment.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer"/>}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20"/>
        <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/35 text-white flex items-center justify-center" aria-label="Close"><X className="w-5 h-5"/></button>
        <div className="absolute left-4 bottom-4 right-4 text-white">
          <p className="text-xs font-bold text-white/70">{categoryLabel[moment.category] || moment.label || 'Meal'}</p>
          <h1 className="mt-1 text-2xl font-display font-black leading-tight">{moment.title}</h1>
          <div className="mt-2 flex gap-3 text-xs text-white/70"><span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/>{moment.date}</span><span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/>{moment.time}</span></div>
        </div>
      </div>

      <div className="p-5 overflow-y-auto space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="rounded-[18px] bg-white border border-[#E4DED4] p-3"><span className="text-[10px] uppercase font-bold text-[#99958C]">Location</span><p className="mt-1 flex items-center gap-1 text-xs font-bold text-[#3D3E39] truncate"><MapPin className="w-3.5 h-3.5 shrink-0"/>{moment.location || 'Not specified'}</p></div>
          <div className="rounded-[18px] bg-white border border-[#E4DED4] p-3"><span className="text-[10px] uppercase font-bold text-[#99958C]">Rating</span><p className="mt-1 text-xs font-bold text-[#3D3E39]">{moment.rating}/5</p></div>
          <div className="rounded-[18px] bg-white border border-[#E4DED4] p-3"><span className="text-[10px] uppercase font-bold text-[#99958C]">Mood</span><p className="mt-1 text-xs font-bold text-[#3D3E39]">{moodLabel[moment.mood] || '—'}</p></div>
          <div className="rounded-[18px] bg-white border border-[#E4DED4] p-3"><span className="text-[10px] uppercase font-bold text-[#99958C]">Nutrition</span><p className="mt-1 flex items-center gap-1 text-xs font-bold text-[#3D3E39]"><Flame className="w-3.5 h-3.5"/>{moment.nutrition?.calories ? `${moment.nutrition.calories} kcal` : 'Optional'}</p></div>
        </div>

        {(moment.hungerLevel || moment.fullnessLevel || moment.eatingPace || moment.distraction || moment.energyAfter) && <div className="rounded-[22px] bg-white border border-[#E4DED4] p-4">
          <h2 className="text-sm font-black text-[#30322E]">Body signals</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            {moment.hungerLevel && <div><span className="text-[#8C8880]">Hunger before</span><strong className="block mt-1">{moment.hungerLevel}/5</strong></div>}
            {moment.fullnessLevel && <div><span className="text-[#8C8880]">Fullness after</span><strong className="block mt-1">{moment.fullnessLevel}/5</strong></div>}
            {moment.eatingPace && <div><span className="text-[#8C8880]">Pace</span><strong className="block mt-1">{paceLabel[moment.eatingPace] || moment.eatingPace}</strong></div>}
            {moment.distraction && <div><span className="text-[#8C8880]">Focus</span><strong className="block mt-1">{focusLabel[moment.distraction] || moment.distraction}</strong></div>}
            {moment.energyAfter && <div><span className="text-[#8C8880]">Energy after</span><strong className="block mt-1">{energyLabel[moment.energyAfter] || moment.energyAfter}</strong></div>}
          </div>
        </div>}

        {moment.notes && <div className="rounded-[22px] bg-[#EFE9DE] p-4"><span className="text-[10px] font-black uppercase tracking-[.12em] text-[#7B776F]">Note</span><p className="mt-2 text-sm leading-relaxed text-[#5E5D57]">{moment.notes}</p></div>}
        {moment.tags?.length ? <div className="flex flex-wrap gap-1.5">{moment.tags.map((tag,i)=><span key={`${tag}-${i}`} className="rounded-full bg-white border border-[#E4DED4] px-3 py-1.5 text-xs text-[#66655F]">#{tag}</span>)}</div> : null}
      </div>

      <footer className="p-4 border-t border-[#E4DED4] bg-white flex items-center justify-between gap-3">
        <div className="flex gap-2"><button onClick={()=>onToggleFavorite(moment.id)} className={`w-10 h-10 rounded-full border flex items-center justify-center ${moment.isFavorite?'bg-rose-50 border-rose-200 text-rose-600':'border-[#E3DDD4] text-[#77736B]'}`} aria-label="Favorite"><Bookmark className={`w-4 h-4 ${moment.isFavorite?'fill-current':''}`}/></button><button onClick={share} className="rounded-full border border-[#E3DDD4] px-4 text-xs font-bold flex items-center gap-1.5">{copied?<><Check className="w-3.5 h-3.5"/>Copied</>:<><Share2 className="w-3.5 h-3.5"/>Share</>}</button></div>
        <div className="flex gap-2"><button onClick={()=>{onClose();onEdit(moment)}} className="rounded-full bg-[#EFE9DE] px-4 py-2.5 text-xs font-black flex items-center gap-1.5"><Edit3 className="w-3.5 h-3.5"/>Edit</button><button onClick={()=>{onClose();onDelete(moment.id)}} className="w-10 h-10 rounded-full text-rose-600 flex items-center justify-center" aria-label="Delete"><Trash2 className="w-4 h-4"/></button></div>
      </footer>
    </section>
  </div>;
};
