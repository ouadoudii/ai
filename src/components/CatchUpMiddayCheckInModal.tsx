import React from 'react';
import { Check, Clock3, Utensils, X } from 'lucide-react';
import { DailyCheckIn, EatingPace, DistractionLevel, FoodMood } from '../types';
import { getLocalDateKey } from '../utils/dateKey';
import { MealVisualPicker } from './MealVisualPicker';

interface CatchUpMiddayCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCheckIn: (checkIn: Omit<DailyCheckIn, 'id' | 'createdAt'>) => void;
}

export const CatchUpMiddayCheckInModal: React.FC<CatchUpMiddayCheckInModalProps> = ({
  isOpen,
  onClose,
  onSaveCheckIn,
}) => {
  const [mealTitle, setMealTitle] = React.useState('');
  const [hungerBefore, setHungerBefore] = React.useState(3);
  const [fullnessAfter, setFullnessAfter] = React.useState(4);
  const [energyLevel, setEnergyLevel] = React.useState(3);
  const [note, setNote] = React.useState('');
  const [eatingPace] = React.useState<EatingPace>('moderate');
  const [distraction] = React.useState<DistractionLevel>('mindful');
  const [mood] = React.useState<FoodMood>('satisfied');

  React.useEffect(() => {
    if (!isOpen) return;
    setMealTitle('');
    setHungerBefore(3);
    setFullnessAfter(4);
    setEnergyLevel(3);
    setNote('');
  }, [isOpen]);

  if (!isOpen) return null;

  const save = () => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    onSaveCheckIn({
      date: getLocalDateKey(),
      time,
      timeOfDay: 'midday',
      food: mealTitle ? {
        mealTitle,
        category: 'lunch',
        hungerBefore,
        fullnessAfter,
        eatingPace,
        distraction,
      } : undefined,
      wellbeing: {
        energyLevel,
        mood,
        stressLevel: 2,
        waterGlasses: 4,
        note,
        voiceTranscription: '',
      },
      coachSummary: 'Mittag nachgetragen. Cary berücksichtigt diesen Tagesabschnitt jetzt wieder in deinem Verlauf.',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-stone-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="p-4 sm:p-5 border-b border-stone-100 bg-stone-50/70 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Mittag nachholen</span>
                <span className="inline-flex items-center gap-1 text-[10px] text-stone-600 bg-white px-2 py-0.5 rounded-full border border-stone-200">
                  <Clock3 className="w-3 h-3" /> jetzt {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h2 className="font-display font-bold text-stone-900 mt-0.5">Was gab es heute Mittag?</h2>
              <p className="text-xs text-stone-600 mt-1">Dein Morgen ist schon erfasst. Bevor Cary zum Abend springt, kannst du den fehlenden Mittagseintrag kurz ergänzen.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Schließen" className="p-2 rounded-xl text-stone-500 hover:bg-stone-100"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          <MealVisualPicker value={mealTitle} onChange={setMealTitle} timePhase="midday" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
              <span className="flex justify-between mb-2"><span>Hunger davor</span><strong>{hungerBefore}/5</strong></span>
              <input className="w-full accent-amber-600" type="range" min="1" max="5" value={hungerBefore} onChange={(e) => setHungerBefore(Number(e.target.value))} />
            </label>
            <label className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
              <span className="flex justify-between mb-2"><span>Sättigung danach</span><strong>{fullnessAfter}/5</strong></span>
              <input className="w-full accent-emerald-700" type="range" min="1" max="5" value={fullnessAfter} onChange={(e) => setFullnessAfter(Number(e.target.value))} />
            </label>
          </div>

          <label className="block p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
            <span className="flex justify-between mb-2"><span>Energie nach dem Mittag</span><strong>{energyLevel}/5</strong></span>
            <input className="w-full accent-emerald-700" type="range" min="1" max="5" value={energyLevel} onChange={(e) => setEnergyLevel(Number(e.target.value))} />
          </label>

          <label className="block text-xs font-semibold text-stone-700">
            Optional: kurze Notiz
            <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="z. B. spät gegessen, unterwegs, kein großes Mittagessen …" className="mt-1.5 w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm font-normal focus:outline-none focus:border-amber-500" />
          </label>
        </div>

        <div className="p-4 border-t border-stone-100 bg-stone-50/70 flex justify-between gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2.5 text-xs font-semibold text-stone-600">Überspringen</button>
          <button type="button" onClick={save} className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs">
            <Check className="w-4 h-4" /> Mittag speichern
          </button>
        </div>
      </div>
    </div>
  );
};
