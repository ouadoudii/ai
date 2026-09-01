import React from 'react';
import { Camera, Mic2, Sparkles, X, Zap } from 'lucide-react';

interface CaptureChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFood: () => void;
  onTellCary: () => void;
  onQuickCheck: () => void;
}

export const CaptureChoiceModal: React.FC<CaptureChoiceModalProps> = ({ isOpen, onClose, onFood, onTellCary, onQuickCheck }) => {
  if (!isOpen) return null;

  const choose = (action: () => void) => {
    onClose();
    action();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-[#241712]/45 backdrop-blur-sm p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="capture-title">
      <section className="w-full sm:max-w-lg rounded-t-[34px] sm:rounded-[34px] bg-[#FFF9F2] p-5 sm:p-7 shadow-[0_28px_80px_rgba(47,30,22,.28)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FDE6D8] px-3 py-1.5 text-[11px] font-black uppercase tracking-[.14em] text-[#A45336]"><Sparkles className="w-3.5 h-3.5" />Festhalten</div>
            <h2 id="capture-title" className="mt-3 font-display text-3xl font-black text-[#34251E]">Was ist gerade passiert?</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#806354]">Du musst nicht wissen, was Cary intern speichert. Wähle einfach den schnellsten Weg.</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 shrink-0 rounded-full bg-white text-[#76594B] flex items-center justify-center border border-[#E8D8CB]" aria-label="Schließen"><X className="w-4 h-4" /></button>
        </div>

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
