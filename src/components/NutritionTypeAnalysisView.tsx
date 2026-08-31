import React from 'react';
import {
  Brain,
  Sparkles,
  Moon,
  CheckCircle2,
  AlertCircle,
  Clock,
  Lock,
  Unlock,
  CalendarDays,
  ListChecks,
} from 'lucide-react';
import { FoodMoment, DailyCheckIn } from '../types';
import { analyzeNutritionType, ALL_ARCHETYPES_INFO } from '../utils/nutritionTypeEngine';

interface NutritionTypeAnalysisViewProps {
  moments: FoodMoment[];
  checkIns: DailyCheckIn[];
  onOpenCheckIn: () => void;
  onOpenAddMoment: () => void;
}

const TARGET_DAYS = 5;

export const NutritionTypeAnalysisView: React.FC<NutritionTypeAnalysisViewProps> = ({
  moments,
  checkIns,
  onOpenCheckIn,
  onOpenAddMoment,
}) => {
  const profile = React.useMemo(() => analyzeNutritionType(moments, checkIns), [moments, checkIns]);

  const uniqueDays = React.useMemo(
    () => new Set([
      ...moments.map((m) => m.date).filter(Boolean),
      ...checkIns.map((c) => c.date).filter(Boolean),
    ]).size,
    [moments, checkIns]
  );

  const entriesProgress = Math.min(100, Math.round((profile.dataPointsCurrent / profile.dataPointsNeeded) * 100));
  const daysProgress = Math.min(100, Math.round((uniqueDays / TARGET_DAYS) * 100));
  const remainingEntries = Math.max(0, profile.dataPointsNeeded - profile.dataPointsCurrent);
  const remainingDays = Math.max(0, TARGET_DAYS - uniqueDays);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
            <div className="space-y-2 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-amber-500/10 text-amber-900 border border-amber-500/20 text-xs font-bold rounded-full flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-amber-600" />
                  Ernährungsmuster
                </span>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${profile.unlocked ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-600'}`}>
                  {profile.unlocked ? `${profile.confidenceScore}% Sicherheit` : 'Lernt noch'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 tracking-tight">
                {profile.unlocked ? profile.typeName : 'Dein Ernährungstyp entsteht gerade'}
              </h1>
              <p className="text-sm text-stone-600 leading-relaxed">
                {profile.unlocked
                  ? profile.subtitle
                  : 'Cary wartet auf wiederkehrende Muster über mehrere Tage, statt dich nach wenigen Mahlzeiten vorschnell einzuordnen.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 shrink-0">
              <button
                onClick={onOpenCheckIn}
                className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-95"
              >
                🎙️ Check-in
              </button>
              <button
                onClick={onOpenAddMoment}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-95"
              >
                + Mahlzeit
              </button>
            </div>
          </div>

          {!profile.unlocked && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-950">Noch kein fester Ernährungstyp</p>
                  <p className="text-xs text-amber-900/80 mt-1 leading-relaxed">
                    Benötigt werden mindestens {profile.dataPointsNeeded} Einträge an mindestens {TARGET_DAYS} verschiedenen Tagen.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-xs font-bold text-stone-800">
                  <ListChecks className="w-4 h-4 text-amber-600" />
                  Einträge
                </span>
                <span className="text-sm font-extrabold text-stone-900">{profile.dataPointsCurrent} / {profile.dataPointsNeeded}</span>
              </div>
              <div className="h-2.5 bg-stone-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${entriesProgress}%` }} />
              </div>
              <p className="text-[11px] text-stone-500">
                {remainingEntries === 0 ? 'Genug Einträge gesammelt.' : `Noch ${remainingEntries} ${remainingEntries === 1 ? 'Eintrag' : 'Einträge'}.`}
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-xs font-bold text-stone-800">
                  <CalendarDays className="w-4 h-4 text-amber-600" />
                  Verschiedene Tage
                </span>
                <span className="text-sm font-extrabold text-stone-900">{uniqueDays} / {TARGET_DAYS}</span>
              </div>
              <div className="h-2.5 bg-stone-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${daysProgress}%` }} />
              </div>
              <p className="text-[11px] text-stone-500">
                {remainingDays === 0 ? 'Genug verschiedene Tage erfasst.' : `Noch ${remainingDays} ${remainingDays === 1 ? 'Tag' : 'Tage'} mit echten Alltagsdaten.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {profile.unlocked ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Was Cary in deinem Muster sieht
              </h2>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{profile.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {profile.traits.map((trait) => (
                  <div key={trait.name} className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <div className="flex justify-between text-xs gap-2">
                      <span className="font-bold text-stone-800">{trait.name}</span>
                      <span className="font-semibold text-amber-700">{trait.label}</span>
                    </div>
                    <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(trait.score / trait.max) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Hilfreich
                </span>
                <ul className="space-y-2 text-xs text-stone-700">
                  {profile.dos.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Nicht überinterpretieren
                </span>
                <ul className="space-y-2 text-xs text-stone-700">
                  {profile.donts.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <Moon className="w-4 h-4 text-amber-600" /> Schlaf & Ernährung
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">{profile.sleepNutritionCorrelation}</p>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                <Clock className="w-4 h-4 text-stone-600" /> Dein Rhythmus
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">{profile.optimalMealTiming}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm">
          <div className="flex items-start gap-3">
            <Unlock className="w-5 h-5 text-stone-400 mt-0.5" />
            <div>
              <h2 className="font-bold text-stone-900 text-sm">Was Cary bis dahin beobachtet</h2>
              <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                Mahlzeitenzeiten, Frühstückshäufigkeit, Hunger und Sättigung, Esstempo, Ablenkung und wiederkehrende Lebensmittelmuster. Erst wenn genügend Tage zusammenkommen, wird daraus ein Ernährungstyp.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200 space-y-3">
        <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">Mögliche Cary-Muster</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ALL_ARCHETYPES_INFO.map((arch) => (
            <div key={arch.type} className={`p-3 rounded-xl border text-xs ${profile.unlocked && arch.type === profile.archetype ? 'bg-amber-100/70 border-amber-300 text-amber-950' : 'bg-white border-stone-200 text-stone-700'}`}>
              <span className="mr-2">{arch.icon}</span>
              <span className="font-semibold">{arch.name}</span>
              {profile.unlocked && arch.type === profile.archetype && <span className="ml-2 text-[10px] font-bold">Dein aktuelles Muster</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
