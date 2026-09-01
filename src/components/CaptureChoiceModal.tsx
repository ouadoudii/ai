import React from 'react';
import { Camera, Clock3, Mic2, RotateCcw, Sparkles, X, Zap } from 'lucide-react';
import type { FoodMoment } from '../types';
import { getRepeatCandidates, repeatMeal } from '../utils/repeatMeal';

interface CaptureChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFood: () => void;
  onTellCary: () => void;
  onQuickCheck: () => void;
}

const MOMENTS_KEY = 'nimmapp_moments_v1';

function readMoments(): FoodMoment[] {
  try {
    const raw = localStorage.getItem(MOMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const CaptureChoiceModal: React.FC<CaptureChoiceModalProps> = ({ isOpen, onClose, onFood, onTellCary, onQuickCheck }) => {
  const [recent, setRecent] = React.useState<FoodMoment[]>([]);

  React.useEffect(() => {
    if (isOpen) setRecent(getRepeatCandidates(readMoments(), 3));
  }, [isOpen]);

  if (!isOpen) return null;

  const choose = (action: () => void) => {
    onClose();
    action();
  };

  const handleRepeat = (source: FoodMoment) => {
    const current = readMoments();
    const repeated = repeatMeal(source);
    localStorage.setItem(MOMENTS_KEY, JSON.stringify([repeated, ...current]));
    onClose();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-[#241712]/45 backdrop-blur-sm p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="capture-title">
      <section className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-[34px] sm:rounded-[34px] bg-[#FFF9F2] p-5 sm:p-7 shadow-[0_28px_80px_rgba(47,30,22,.28)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FDE6D8] px-3 py-1.5 text-[11px] font-black uppercase tracking-[.14em] text-[#A45336]"><Sparkles className="w-3.5 h-3.5" />Festhalten</div>
            <h2 id="capture-title" className="mt-3 font-display text-3xl font-black text-[#34251E]">Was ist gerade passiert?</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#806354]">Du musst nicht wissen, was Cary intern speichert. Wähle einfach den schnellsten Weg.</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 shrink-0 rounded-full bg-white text-[#76594B] flex items-center justify-center border border-[#E8D8CB]" aria-label="Schließen"><X className="w-4 h-4" /></button>
        </div>

        {recent.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.12em] text-[#8A6452]"><RotateCcw className="w-3.5 h-3.5" />Wie letztes Mal</div><span className="text-[10px] text-[#A28676]">1 Tap</span></div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 snap-x">
              {recent.map((moment) => (
                <button key={moment.id} onClick={() => handleRepeat(moment)} className="shrink-0 w-[72%] sm:w-[45%] snap-start rounded-[22px] bg-white border border-[#E7D9CE] p-3 text-left shadow-sm">
                  <div className="flex items-start gap-3"><img src={moment.imageUrl} alt="" className="w-12 h-12 rounded-2xl object-cover bg-[#F2E8DF]"/><div className="min-w-0"><strong className="block truncate text-sm text-[#3C2A22]">{moment.title}</strong><span className="mt-1 flex items-center gap-1 text-[10px] text-[#947565]"><Clock3 className="w-3 h-3" />{moment.label || 'Mahlzeit'}</span></div></div>
                  <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-black text-[#B65F3F]"><RotateCcw className="w-3.5 h-3.5" />Jetzt wiederholen</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button onClick={() => choose(onFood)} className="w-full rounded-[24px] bg-[#E86F45] p-4 text-left text-white flex items-center gap-4 shadow-sm">
            <span className="w-12 h-12 rounded-2xl bg-white/18 flex items-center justify-center"><Camera className="w-6 h-6" /></span>
            <span className="flex-1"><strong className="block text-base">Essen festhalten</strong><span className="block mt-1 text-xs text-white/78">Foto wählen oder Mahlzeit mit wenigen Taps speichern.</span></span>
          </button>
          <button onClick={() => choose(onTellCary)} className="w-full rounded-[24px] bg-[#263C32] p-4 text-left text-white flex items-center gap-4 shadow-sm">
            <span className="w-12 h-12 rounded-2xl bg-white/12 flex items-center justify-center"><Mic2 className="w-6 h-6" /></span>
            <span className="flex-1"><strong className="block text-base">Cary erzählen</strong><span className="block mt-1 text-xs text-white/72">Sprich frei über Schlaf, Essen, Energie oder Stimmung.</span></span>
          </button>
          <button onClick={() => choose(onQuickCheck)} className="w-full rounded-[24px] bg-[#F2B55F] p-4 text-left text-[#432B1D] flex items-center gap-4 shadow-sm">
            <span className="w-12 h-12 rounded-2xl bg-white/35 flex items-center justify-center"><Zap className="w-6 h-6" /></span>
            <span className="flex-1"><strong className="block text-base">Kurz-Check</strong><span className="block mt-1 text-xs text-[#6F4C36]">Ein paar Taps zu Energie, Stimmung und deinem aktuellen Tagesmoment.</span></span>
          </button>
        </div>
      </section>
    </div>
  );
};
