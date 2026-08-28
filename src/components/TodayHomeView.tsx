import React from 'react';
import {
  Heart,
  Dna,
  Plus,
  MessageSquare,
  ChevronRight,
  Smile,
} from 'lucide-react';
import { FoodMoment, DailyCheckIn } from '../types';
import { CaringVoiceHero } from './CaringVoiceHero';
import { CaringGuardian } from './CaringGuardian';
import { evaluateNutritionAlarms } from '../utils/interventionEngine';
import { analyzeNutritionType } from '../utils/nutritionTypeEngine';

interface TodayHomeViewProps {
  moments: FoodMoment[];
  checkIns: DailyCheckIn[];
  onOpenAddModal: () => void;
  onOpenCheckInModal: () => void;
  onSelectMoment: (moment: FoodMoment) => void;
  onNavigateToCoach: () => void;
  onNavigateToTypeAnalysis: () => void;
  onNavigateToTimeline: () => void;
  onSaveCheckIn?: (checkIn: Omit<DailyCheckIn, 'id' | 'createdAt'>) => void;
}

export const TodayHomeView: React.FC<TodayHomeViewProps> = ({
  moments,
  checkIns,
  onOpenAddModal,
  onOpenCheckInModal,
  onSelectMoment,
  onNavigateToCoach,
  onNavigateToTypeAnalysis,
  onNavigateToTimeline,
  onSaveCheckIn,
}) => {
  const nutritionProfile = React.useMemo(() => analyzeNutritionType(moments, checkIns), [moments, checkIns]);
  const guardianStatus = React.useMemo(() => {
    return evaluateNutritionAlarms(moments, checkIns, nutritionProfile.archetype);
  }, [moments, checkIns, nutritionProfile.archetype]);

  const handleQuickVoiceSubmit = (text: string, aiResult?: any) => {
    if (!onSaveCheckIn) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentHour = new Date().getHours();
    const timeOfDay = currentHour < 11 ? 'morning' : currentHour < 16 ? 'midday' : 'evening';

    const extracted = aiResult?.extractedData || {};

    onSaveCheckIn({
      date: todayStr,
      time: timeStr,
      timeOfDay,
      sleep: extracted.sleepHours ? {
        durationHours: extracted.sleepHours,
        quality: 4,
        wakeFeeling: 'refreshed',
      } : undefined,
      food: extracted.mealTitle ? {
        mealTitle: extracted.mealTitle,
        category: extracted.mealCategory || (timeOfDay === 'morning' ? 'breakfast' : timeOfDay === 'midday' ? 'lunch' : 'dinner'),
        hungerBefore: extracted.hungerBefore || 3,
        fullnessAfter: extracted.fullnessAfter || 4,
        eatingPace: 'slow',
        distraction: 'mindful',
      } : undefined,
      wellbeing: {
        energyLevel: extracted.energyLevel || 4,
        mood: extracted.mood || 'energized',
        stressLevel: 2,
        waterGlasses: 3,
        note: text,
        voiceTranscription: text,
      },
      coachSummary: aiResult?.coachFeedback?.message || `Voice Check-in erfasst: "${text}"`,
    });
  };

  const todayKey = new Date().toISOString().split('T')[0];
  const todayMoments = React.useMemo(
    () => moments.filter((moment) => moment.date === todayKey).slice(0, 3),
    [moments, todayKey],
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <CaringVoiceHero
        onOpenFullCheckIn={onOpenCheckInModal}
        onQuickVoiceSubmit={handleQuickVoiceSubmit}
        recentMoments={moments}
        latestCheckIn={checkIns[0]}
        archetype={nutritionProfile.archetype}
      />

      <CaringGuardian
        guardianStatus={guardianStatus}
        userArchetype={nutritionProfile.archetype}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={onNavigateToTypeAnalysis}
          className="text-left bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs hover:border-amber-400 hover:bg-amber-50/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 transition-all flex items-center justify-between gap-4 group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Dna className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Dein Ernährungstyp</span>
              <h3 className="text-base sm:text-lg font-display font-bold text-stone-900 leading-tight">{nutritionProfile.typeName}</h3>
              <p className="text-xs text-stone-500 mt-0.5">{nutritionProfile.tagline}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-amber-600 transition-colors shrink-0" />
        </button>

        <button
          type="button"
          onClick={onNavigateToCoach}
          className="text-left bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs hover:border-emerald-400 hover:bg-emerald-50/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 transition-all flex items-center justify-between gap-4 group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Smile className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Cary ist für dich da</span>
              <h3 className="text-base sm:text-lg font-display font-bold text-stone-900 leading-tight">Fragen & Tages-Tipps</h3>
              <p className="text-xs text-stone-500 mt-0.5">Frag Cary nach Rezepten, Schlaf & Wohlbefinden</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-emerald-700 transition-colors shrink-0" />
        </button>
      </div>

      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs space-y-4" aria-labelledby="today-moments-title">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Heart className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
            <h3 id="today-moments-title" className="font-display font-bold text-base sm:text-lg text-stone-900">Heute</h3>
          </div>
          <button
            type="button"
            onClick={onNavigateToTimeline}
            className="text-xs font-semibold text-amber-700 hover:text-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg flex items-center gap-1 shrink-0"
          >
            <span>Verlauf</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayMoments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {todayMoments.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => onSelectMoment(m)}
                className="text-left p-3 rounded-2xl bg-stone-50 hover:bg-stone-100/80 border border-stone-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-all flex flex-col justify-between space-y-2 group"
              >
                <div className="flex items-center gap-2.5">
                  <img src={m.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-stone-500 uppercase block">{m.label} • {m.time}</span>
                    <h4 className="text-xs sm:text-sm font-semibold text-stone-900 truncate group-hover:text-amber-700">{m.title}</h4>
                  </div>
                </div>
                <div className="text-[11px] text-stone-500 flex items-center justify-between pt-1 border-t border-stone-200/40">
                  <span>Hunger: {m.hungerLevel || 3}/5</span>
                  <span>Sättigung: {m.fullnessLevel || 4}/5</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/70 px-5 py-6 text-center">
            <div className="mx-auto mb-3 w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <h4 className="font-display font-bold text-stone-900">Noch kein Moment heute</h4>
            <p className="mt-1 text-sm text-stone-500 max-w-sm mx-auto">Halte einfach fest, was du gegessen hast oder wie du dich gerade fühlst. Ein kurzer Eintrag reicht.</p>
            <div className="mt-4 flex flex-col sm:flex-row justify-center gap-2.5">
              <button
                type="button"
                onClick={onOpenAddModal}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Moment hinzufügen
              </button>
              <button
                type="button"
                onClick={onOpenCheckInModal}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-stone-200 px-4 py-2.5 text-sm font-bold text-stone-700 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Kurz einchecken
              </button>
            </div>
          </div>
        )}

        {todayMoments.length > 0 && (
          <button
            type="button"
            onClick={onOpenAddModal}
            className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Weiteren Moment hinzufügen</span>
          </button>
        )}
      </section>
    </div>
  );
};
