import React from 'react';
import { 
  Brain, 
  Sparkles, 
  Moon, 
  Utensils, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  Lock, 
  Unlock, 
  Zap, 
  Flame,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { FoodMoment, DailyCheckIn, NutritionTypeProfile } from '../types';
import { analyzeNutritionType, ALL_ARCHETYPES_INFO } from '../utils/nutritionTypeEngine';
import { fetchServerNutritionArchetype } from '../apiClient';

interface NutritionTypeAnalysisViewProps {
  moments: FoodMoment[];
  checkIns: DailyCheckIn[];
  onOpenCheckIn: () => void;
  onOpenAddMoment: () => void;
}

export const NutritionTypeAnalysisView: React.FC<NutritionTypeAnalysisViewProps> = ({
  moments,
  checkIns,
  onOpenCheckIn,
  onOpenAddMoment,
}) => {
  const localFallback = React.useMemo(() => {
    return analyzeNutritionType(moments, checkIns);
  }, [moments, checkIns]);

  const [profile, setProfile] = React.useState<NutritionTypeProfile>(localFallback);
  const [isLoadingServerAnalysis, setIsLoadingServerAnalysis] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    setIsLoadingServerAnalysis(true);

    fetchServerNutritionArchetype(moments, checkIns)
      .then((serverProfile) => {
        if (isMounted) {
          setProfile(serverProfile);
        }
      })
      .catch((err) => {
        console.warn('Using client archetype fallback:', err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingServerAnalysis(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [moments, checkIns]);

  const [selectedPreviewArchetype, setSelectedPreviewArchetype] = React.useState<string | null>(null);

  const totalLogs = moments.length + checkIns.length;
  const progressPercent = Math.min(100, Math.round((totalLogs / 6) * 100));

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      
      {/* Top Hero Banner: Ernährungstyp-Analyse */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-500/10 text-amber-900 border border-amber-500/20 text-xs font-bold rounded-full flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-amber-600" />
                <span>KI-Ernährungstyp-Analyse</span>
              </span>
              <span className="px-2.5 py-0.5 bg-stone-100 text-stone-600 text-xs font-semibold rounded-full">
                {profile.unlocked ? `${profile.confidenceScore}% Konfidenz` : 'Wird kalibriert'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 tracking-tight">
              {profile.typeName}
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              {profile.subtitle}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenCheckIn}
              className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <span>🎙️ Sprach-Check-in</span>
            </button>

            <button
              onClick={onOpenAddMoment}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <span>+ Mahlzeit eintragen</span>
            </button>
          </div>
        </div>

        {/* Calibration Progress Bar */}
        <div className="mt-6 pt-5 border-t border-stone-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-stone-700 flex items-center gap-1">
                {profile.unlocked ? <Unlock className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-amber-600" />}
                <span>Datenpunkte zur Schärfung deines Ernährungstyps</span>
              </span>
              <span className="font-bold text-amber-800">{totalLogs} / 6 Einträge ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="text-right hidden md:block">
            <span className="text-xs text-stone-500 block">
              {totalLogs >= 6 
                ? '✅ Dein Profil ist vollständig entschlüsselt' 
                : `Noch ${Math.max(0, 6 - totalLogs)} Einträge für maximale Präzision`}
            </span>
          </div>
        </div>
      </div>

      {/* Core Profile Breakdown (Traits & Circadian Impact) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left 2 Cols: Traits & Profile Core */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Detailed Description Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Charakteristik deines Stoffwechsel- & Genussmusters</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {profile.description}
            </p>

            {/* Trait Meters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {profile.traits.map((t) => (
                <div key={t.name} className="p-3.5 bg-stone-50/80 rounded-2xl border border-stone-200/70 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-stone-800">{t.name}</span>
                    <span className="font-semibold text-amber-700 bg-white px-2 py-0.5 rounded-md border border-stone-200 text-[11px]">
                      {t.label}
                    </span>
                  </div>
                  <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full" 
                      style={{ width: `${(t.score / t.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dos and Don'ts Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dos */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Empfohlene Erfolgsfaktoren (Do's)</span>
              </span>
              <ul className="space-y-2 text-xs text-stone-700">
                {profile.dos.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Don'ts */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Vermeide diese Bremsen (Don'ts)</span>
              </span>
              <ul className="space-y-2 text-xs text-stone-700">
                {profile.donts.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Right 1 Col: Sleep-Food Correlation & Circadian Rhythm */}
        <div className="space-y-5">
          
          {/* Schlaf-Ernährung-Korrelation */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3.5">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Moon className="w-4 h-4 text-amber-600" />
              <span>Schlaf- & Regenerations-Effekt</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              {profile.sleepNutritionCorrelation}
            </p>
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/60 text-xs text-amber-950 font-medium">
              💡 <strong>Tipp:</strong> Dokumentiere deinen Schlaf morgens im Schnell-Check, um die Korrelation zu schärfen.
            </div>
          </div>

          {/* Optimales Timing */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
              <Clock className="w-4 h-4 text-stone-600" />
              <span>Optimaler Mahlzeiten-Rhythmus</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              {profile.optimalMealTiming}
            </p>
          </div>

          {/* Alle 4 Ernährungstypen im Überblick */}
          <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
              Ernährungstypen der Cary Matrix
            </span>
            <div className="space-y-2">
              {ALL_ARCHETYPES_INFO.map((arch) => (
                <div 
                  key={arch.type}
                  className={`p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between ${
                    arch.type === profile.archetype
                      ? 'bg-amber-100/70 border-amber-300 font-bold text-amber-950'
                      : 'bg-white border-stone-200/80 text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{arch.icon}</span>
                    <div>
                      <span className="block font-semibold">{arch.name}</span>
                    </div>
                  </div>
                  {arch.type === profile.archetype && (
                    <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full">
                      Dein Typ
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
