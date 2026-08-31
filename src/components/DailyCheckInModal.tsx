import React from 'react';
import { X, Moon, Sun, Utensils, ArrowRight, Check, BatteryCharging } from 'lucide-react';
import { DailyCheckIn, TimeOfDayPhase, FoodMood } from '../types';
import { MealVisualPicker } from './MealVisualPicker';
import { getLocalDateKey } from '../utils/dateKey';

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCheckIn: (checkIn: Omit<DailyCheckIn, 'id' | 'createdAt'>) => void;
  existingCheckInsCount?: number;
}

const phaseCopy: Record<TimeOfDayPhase, { label: string; title: string; subtitle: string }> = {
  morning: { label: 'Morgen', title: 'Guten Morgen', subtitle: 'Schlaf und Frühstück – kurz festhalten.' },
  midday: { label: 'Mittag', title: 'Wie war dein Mittag?', subtitle: 'Essen und Körpergefühl in wenigen Sekunden.' },
  evening: { label: 'Abend', title: 'Wie geht dein Tag zu Ende?', subtitle: 'Abendessen und Energie – dann bist du fertig.' },
};

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({ isOpen, onClose, onSaveCheckIn }) => {
  const currentHour = new Date().getHours();
  const timePhase: TimeOfDayPhase = currentHour >= 5 && currentHour < 11 ? 'morning' : currentHour >= 11 && currentHour < 16 ? 'midday' : 'evening';
  const totalSteps = timePhase === 'morning' ? 2 : 2;
  const [step, setStep] = React.useState(1);
  const [sleepHours, setSleepHours] = React.useState(7.5);
  const [sleepQuality, setSleepQuality] = React.useState(4);
  const [wakeFeeling, setWakeFeeling] = React.useState<'refreshed' | 'normal' | 'tired' | 'exhausted'>('normal');
  const [mealTitle, setMealTitle] = React.useState('');
  const [hungerBefore, setHungerBefore] = React.useState(3);
  const [fullnessAfter, setFullnessAfter] = React.useState(4);
  const [energyLevel, setEnergyLevel] = React.useState(3);
  const [mood, setMood] = React.useState<FoodMood>('satisfied');

  React.useEffect(() => {
    if (isOpen) setStep(1);
  }, [isOpen]);

  if (!isOpen) return null;

  const finish = () => {
    const now = new Date();
    onSaveCheckIn({
      date: getLocalDateKey(now),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeOfDay: timePhase,
      sleep: timePhase === 'morning' ? { durationHours: sleepHours, quality: sleepQuality, wakeFeeling } : undefined,
      food: mealTitle ? {
        mealTitle,
        category: timePhase === 'morning' ? 'breakfast' : timePhase === 'midday' ? 'lunch' : 'dinner',
        hungerBefore,
        fullnessAfter,
        eatingPace: 'moderate',
        distraction: 'mindful',
      } : undefined,
      wellbeing: { energyLevel, mood, stressLevel: 2, waterGlasses: 0 },
      coachSummary: 'Gespeichert. Cary nutzt den Eintrag erst zusammen mit weiteren Tagen, um Muster zu erkennen.',
    });
    onClose();
  };

  const copy = phaseCopy[timePhase];
  const moodOptions: Array<{ value: FoodMood; emoji: string; label: string }> = [
    { value: 'energized', emoji: '⚡', label: 'Energie' },
    { value: 'satisfied', emoji: '🙂', label: 'Gut' },
    { value: 'comfort', emoji: '😌', label: 'Ruhig' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-950/35 sm:p-4">
      <section className="w-full sm:max-w-lg max-h-[94vh] overflow-hidden bg-[#FBFAF7] rounded-t-[28px] sm:rounded-[28px] border border-stone-200 shadow-2xl flex flex-col" aria-modal="true" role="dialog">
        <header className="px-5 pt-5 pb-4 flex items-start justify-between">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-amber-700">
              {timePhase === 'morning' ? <Sun className="w-5 h-5" /> : timePhase === 'midday' ? <Utensils className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-stone-500">{copy.label} · {step}/{totalSteps}</p>
              <h2 className="text-xl font-display font-bold text-stone-900 mt-0.5">{copy.title}</h2>
              <p className="text-xs text-stone-500 mt-1">{copy.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Schließen" className="p-2 rounded-xl text-stone-500 hover:bg-stone-100"><X className="w-5 h-5" /></button>
        </header>

        <div className="h-1 bg-stone-200 mx-5 rounded-full overflow-hidden"><div className="h-full bg-amber-500 transition-all" style={{ width: `${(step / totalSteps) * 100}%` }} /></div>

        <div className="p-5 overflow-y-auto flex-1">
          {step === 1 && timePhase === 'morning' && (
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-end mb-2"><h3 className="font-bold text-stone-900">Wie lange hast du geschlafen?</h3><strong className="text-amber-800">{sleepHours} h</strong></div>
                <input type="range" min="4" max="11" step="0.5" value={sleepHours} onChange={(e) => setSleepHours(Number(e.target.value))} className="w-full accent-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-800 mb-2">Wie erholsam war es?</p>
                <div className="grid grid-cols-5 gap-2">{[1,2,3,4,5].map((n) => <button key={n} onClick={() => setSleepQuality(n)} className={`h-11 rounded-xl border font-bold ${sleepQuality === n ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-stone-200 text-stone-700'}`}>{n}</button>)}</div>
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-800 mb-2">Beim Aufwachen</p>
                <div className="grid grid-cols-2 gap-2">{[
                  ['refreshed','☀️','Frisch'],['normal','🙂','Okay'],['tired','🥱','Müde'],['exhausted','😴','Erschöpft']
                ].map(([value,emoji,label]) => <button key={value} onClick={() => setWakeFeeling(value as typeof wakeFeeling)} className={`p-3 rounded-xl border text-left ${wakeFeeling === value ? 'bg-amber-50 border-amber-400' : 'bg-white border-stone-200'}`}><span className="mr-2">{emoji}</span><span className="text-sm font-semibold">{label}</span></button>)}</div>
              </div>
            </div>
          )}

          {step === 1 && timePhase !== 'morning' && (
            <div className="space-y-5">
              <MealVisualPicker value={mealTitle} onChange={setMealTitle} timePhase={timePhase} />
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-stone-200 rounded-2xl p-3"><div className="flex justify-between text-xs mb-2"><span>Hunger vorher</span><strong>{hungerBefore}/5</strong></div><input type="range" min="1" max="5" value={hungerBefore} onChange={(e) => setHungerBefore(Number(e.target.value))} className="w-full accent-amber-600" /></div>
                <div className="bg-white border border-stone-200 rounded-2xl p-3"><div className="flex justify-between text-xs mb-2"><span>Satt danach</span><strong>{fullnessAfter}/5</strong></div><input type="range" min="1" max="5" value={fullnessAfter} onChange={(e) => setFullnessAfter(Number(e.target.value))} className="w-full accent-amber-600" /></div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {timePhase === 'morning' && <MealVisualPicker value={mealTitle} onChange={setMealTitle} timePhase="morning" />}
              <div>
                <div className="flex items-center justify-between mb-3"><span className="font-bold text-stone-900 flex items-center gap-2"><BatteryCharging className="w-4 h-4" /> Wie ist deine Energie?</span><strong>{energyLevel}/5</strong></div>
                <input type="range" min="1" max="5" value={energyLevel} onChange={(e) => setEnergyLevel(Number(e.target.value))} className="w-full accent-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-800 mb-2">Wie fühlst du dich gerade?</p>
                <div className="grid grid-cols-3 gap-2">{moodOptions.map((option) => <button key={option.value} onClick={() => setMood(option.value)} className={`py-3 rounded-2xl border ${mood === option.value ? 'bg-amber-50 border-amber-400' : 'bg-white border-stone-200'}`}><span className="block text-xl">{option.emoji}</span><span className="text-xs font-semibold mt-1 block">{option.label}</span></button>)}</div>
              </div>
              <p className="text-xs leading-relaxed text-stone-500 bg-white border border-stone-200 rounded-2xl p-3">Cary bewertet keinen einzelnen Eintrag. Hinweise entstehen erst, wenn sich über mehrere Tage ein belastbares Muster zeigt.</p>
            </div>
          )}
        </div>

        <footer className="p-4 border-t border-stone-200 bg-white flex items-center justify-between gap-3">
          <button onClick={step === 1 ? onClose : () => setStep(1)} className="px-4 py-3 text-sm font-semibold text-stone-500">{step === 1 ? 'Später' : 'Zurück'}</button>
          {step < totalSteps ? <button onClick={() => setStep(2)} className="min-w-32 px-5 py-3 rounded-2xl bg-stone-900 text-white font-bold text-sm flex items-center justify-center gap-2">Weiter <ArrowRight className="w-4 h-4" /></button> : <button onClick={finish} className="min-w-32 px-5 py-3 rounded-2xl bg-amber-500 text-white font-bold text-sm flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Speichern</button>}
        </footer>
      </section>
    </div>
  );
};