import React from 'react';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  ListChecks,
  Moon,
  Sparkles,
} from 'lucide-react';
import { FoodMoment, DailyCheckIn } from '../types';
import { analyzeNutritionType } from '../utils/nutritionTypeEngine';

interface NutritionTypeAnalysisViewProps {
  moments: FoodMoment[];
  checkIns: DailyCheckIn[];
  onOpenCheckIn: () => void;
  onOpenAddMoment: () => void;
}

const TARGET_DAYS = 5;
const isSeededDemoCheckIn = (checkIn: DailyCheckIn) => /^checkin-\d{1,2}$/.test(checkIn.id);
const isSeededDemoMoment = (moment: FoodMoment) => /^moment-\d{1,2}$/.test(moment.id);

export const NutritionTypeAnalysisView: React.FC<NutritionTypeAnalysisViewProps> = ({
  moments,
  checkIns,
  onOpenCheckIn,
  onOpenAddMoment,
}) => {
  const profile = React.useMemo(() => analyzeNutritionType(moments, checkIns), [moments, checkIns]);
  const realMoments = React.useMemo(() => moments.filter((m) => !isSeededDemoMoment(m)), [moments]);
  const realCheckIns = React.useMemo(() => checkIns.filter((c) => !isSeededDemoCheckIn(c)), [checkIns]);

  const uniqueDays = React.useMemo(
    () => new Set([
      ...realMoments.map((m) => m.date).filter(Boolean),
      ...realCheckIns.map((c) => c.date).filter(Boolean),
    ]).size,
    [realMoments, realCheckIns],
  );

  const entriesProgress = Math.min(100, Math.round((profile.dataPointsCurrent / profile.dataPointsNeeded) * 100));
  const daysProgress = Math.min(100, Math.round((uniqueDays / TARGET_DAYS) * 100));

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in duration-200 pb-16">
      <section className="pt-2 sm:pt-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Dein Muster</p>
        <h1 className="mt-1 text-3xl sm:text-4xl font-display font-bold tracking-tight text-stone-950">
          {profile.unlocked ? 'Was dir offenbar guttut' : 'Cary lernt deinen Alltag kennen'}
        </h1>
        <p className="mt-2 max-w-2xl text-sm sm:text-base leading-relaxed text-stone-600">
          Cary sucht nach wiederkehrenden Zusammenhängen zwischen Essen, Hunger, Sättigung, Energie und Schlaf. Einzelne Tage werden nicht überbewertet.
        </p>
      </section>

      <section className="rounded-[28px] border border-stone-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${profile.unlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>
                {profile.unlocked ? `${profile.confidenceScore}% Sicherheit` : 'Lernt noch'}
              </span>
              {profile.unlocked && <span className="text-xs font-semibold text-stone-500">Aktuelles Muster: {profile.typeName}</span>}
            </div>
            <h2 className="mt-3 text-xl sm:text-2xl font-display font-bold text-stone-950">
              {profile.unlocked ? profile.subtitle : 'Noch keine feste Aussage'}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              {profile.unlocked
                ? profile.description
                : 'Cary wartet auf genug echte Alltagssituationen über mehrere Tage. So entsteht ein Bild aus Verhalten statt aus einer einzelnen Mahlzeit.'}
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <button type="button" onClick={onOpenCheckIn} className="rounded-xl bg-stone-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-stone-800">Check-in</button>
            <button type="button" onClick={onOpenAddMoment} className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-800 hover:bg-stone-50">Mahlzeit</button>
          </div>
        </div>

        {!profile.unlocked && (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl bg-stone-50 border border-stone-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-xs font-bold text-stone-700"><ListChecks className="w-4 h-4" />Einträge</span>
                <span className="text-sm font-bold text-stone-950">{profile.dataPointsCurrent}/{profile.dataPointsNeeded}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-stone-200 overflow-hidden"><div className="h-full rounded-full bg-stone-900" style={{ width: `${entriesProgress}%` }} /></div>
            </div>
            <div className="rounded-2xl bg-stone-50 border border-stone-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-xs font-bold text-stone-700"><CalendarDays className="w-4 h-4" />Verschiedene Tage</span>
                <span className="text-sm font-bold text-stone-950">{uniqueDays}/{TARGET_DAYS}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-stone-200 overflow-hidden"><div className="h-full rounded-full bg-stone-900" style={{ width: `${daysProgress}%` }} /></div>
            </div>
          </div>
        )}
      </section>

      {profile.unlocked ? (
        <>
          <section className="rounded-[28px] border border-stone-200 bg-[#F4F1EA] p-5 sm:p-6">
            <div className="flex items-center gap-2 text-sm font-bold text-stone-950"><Sparkles className="w-4 h-4" />Was Cary wiederholt sieht</div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.traits.map((trait) => (
                <div key={trait.name} className="rounded-2xl bg-white/80 border border-stone-200 p-4">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-bold text-stone-800">{trait.name}</span>
                    <span className="font-semibold text-stone-500">{trait.label}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-stone-200 overflow-hidden"><div className="h-full rounded-full bg-stone-900" style={{ width: `${(trait.score / trait.max) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-stone-950"><Moon className="w-4 h-4" />Schlaf & Essen</div>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{profile.sleepNutritionCorrelation}</p>
            </div>
            <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-stone-950"><Clock className="w-4 h-4" />Rhythmus</div>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{profile.optimalMealTiming}</p>
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-800"><CheckCircle2 className="w-4 h-4" />Was du ausprobieren kannst</div>
              <ul className="mt-3 space-y-2 text-sm text-stone-600">
                {profile.dos.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
            <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-stone-800"><AlertCircle className="w-4 h-4" />Mit Vorsicht lesen</div>
              <ul className="mt-3 space-y-2 text-sm text-stone-600">
                {profile.donts.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-[28px] border border-stone-200 bg-white p-5 sm:p-6 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">Was Cary beobachtet</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {['Essenszeiten', 'Frühstück', 'Hunger', 'Sättigung', 'Esstempo', 'Ablenkung', 'Energie', 'Schlaf'].map((label) => (
              <span key={label} className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700">{label}</span>
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-stone-600">Sobald genug Daten vorhanden sind, formuliert Cary vorsichtige Zusammenhänge. Du bekommst keine Diagnose und keine starre Identität, sondern ein veränderliches persönliches Muster.</p>
        </section>
      )}
    </div>
  );
};
