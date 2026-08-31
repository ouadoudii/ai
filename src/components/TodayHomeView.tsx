import React from 'react';
import {
  ArrowRight,
  Check,
  ChevronRight,
  Circle,
  Clock3,
  Download,
  History,
  MessageCircle,
  Plus,
  ShieldCheck,
  Sparkles,
  Sunrise,
  SunMedium,
  MoonStar,
} from 'lucide-react';
import { FoodMoment, DailyCheckIn, TimeOfDayPhase } from '../types';
import { analyzeNutritionType } from '../utils/nutritionTypeEngine';
import { getLocalDateKey } from '../utils/dateKey';
import { downloadCaryDataExport } from '../utils/dataExport';
import { getRecentTodayMoments } from '../utils/todayFeed';

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

const isSeededDemoCheckIn = (checkIn: DailyCheckIn) => /^checkin-\d{1,2}$/.test(checkIn.id);
const isSeededDemoMoment = (moment: FoodMoment) => /^moment-\d{1,2}$/.test(moment.id);

const phaseMeta: Record<TimeOfDayPhase, { label: string; eyebrow: string; icon: React.ReactNode }> = {
  morning: { label: 'Morgen', eyebrow: 'Schlaf & Frühstück', icon: <Sunrise className="w-5 h-5" /> },
  midday: { label: 'Mittag', eyebrow: 'Essen & Energie', icon: <SunMedium className="w-5 h-5" /> },
  evening: { label: 'Abend', eyebrow: 'Abendessen & Rückblick', icon: <MoonStar className="w-5 h-5" /> },
};

const currentPhaseForHour = (hour: number): TimeOfDayPhase => {
  if (hour < 11) return 'morning';
  if (hour < 16) return 'midday';
  return 'evening';
};

export const TodayHomeView: React.FC<TodayHomeViewProps> = ({
  moments,
  checkIns,
  onOpenAddModal,
  onOpenCheckInModal,
  onSelectMoment,
  onNavigateToCoach,
  onNavigateToTypeAnalysis,
  onNavigateToTimeline,
}) => {
  const todayKey = getLocalDateKey();
  const hour = new Date().getHours();
  const currentPhase = currentPhaseForHour(hour);
  const nutritionProfile = React.useMemo(() => analyzeNutritionType(moments, checkIns), [moments, checkIns]);

  const realTodayCheckIns = React.useMemo(
    () => checkIns.filter((c) => c.date === todayKey && !isSeededDemoCheckIn(c)),
    [checkIns, todayKey],
  );
  const realTodayMoments = React.useMemo(
    () => moments.filter((m) => m.date === todayKey && !isSeededDemoMoment(m)),
    [moments, todayKey],
  );

  const completed = React.useMemo(() => ({
    morning: realTodayCheckIns.some((c) => c.timeOfDay === 'morning') || realTodayMoments.some((m) => m.category === 'breakfast'),
    midday: realTodayCheckIns.some((c) => c.timeOfDay === 'midday') || realTodayMoments.some((m) => m.category === 'lunch'),
    evening: realTodayCheckIns.some((c) => c.timeOfDay === 'evening') || realTodayMoments.some((m) => m.category === 'dinner'),
  }), [realTodayCheckIns, realTodayMoments]);

  const eligiblePhases = React.useMemo<TimeOfDayPhase[]>(() => {
    if (currentPhase === 'morning') return ['morning'];
    if (currentPhase === 'midday') return ['morning', 'midday'];
    return ['morning', 'midday', 'evening'];
  }, [currentPhase]);

  const nextPhase = eligiblePhases.find((phase) => !completed[phase]);
  const allEligibleDone = !nextPhase;
  const isCatchUp = !!nextPhase && nextPhase !== currentPhase;
  const primaryPhase = nextPhase || currentPhase;

  const todayMoments = React.useMemo(
    () => getRecentTodayMoments(realTodayMoments, todayKey, 3),
    [realTodayMoments, todayKey],
  );

  const dateLabel = React.useMemo(
    () => new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()),
    [],
  );

  const completedCount = (['morning', 'midday', 'evening'] as TimeOfDayPhase[]).filter((phase) => completed[phase]).length;
  const learningText = nutritionProfile.unlocked
    ? nutritionProfile.recommendedFocus
    : `Cary lernt noch. ${nutritionProfile.dataPointsCurrent}/${nutritionProfile.dataPointsNeeded} verwertbare Einträge sind gesammelt.`;

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in duration-200">
      <section className="pt-2 sm:pt-4">
        <p className="text-xs font-semibold text-stone-500 capitalize">{dateLabel}</p>
        <div className="mt-1 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-stone-950">Heute</h1>
            <p className="mt-1 text-sm sm:text-base text-stone-600">Cary begleitet dich Schritt für Schritt durch deinen Tag.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-stone-500">
            <span>{completedCount}/3</span>
            <span>erledigt</span>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-stone-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-stone-950 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">Als Nächstes</p>
            <h2 className="mt-1 text-xl sm:text-2xl font-display font-bold text-stone-950">
              {allEligibleDone ? 'Für jetzt ist alles erledigt' : isCatchUp ? `${phaseMeta[primaryPhase].label} kurz nachholen` : `${phaseMeta[primaryPhase].label}-Check`}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
              {allEligibleDone
                ? 'Du musst gerade nichts nachtragen. Wenn du möchtest, kannst du jederzeit noch eine Mahlzeit oder Beobachtung festhalten.'
                : isCatchUp
                  ? `Der ${phaseMeta[primaryPhase].label.toLowerCase()}-Abschnitt fehlt noch. Cary holt ihn zuerst nach, bevor dein Tag weitergeht.`
                  : `Ein kurzer Check reicht. ${phaseMeta[primaryPhase].eyebrow} – ohne langen Fragebogen.`}
            </p>
            <button
              type="button"
              onClick={allEligibleDone ? onOpenAddModal : onOpenCheckInModal}
              className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-950 px-5 py-3 text-sm font-bold text-white hover:bg-stone-800 active:scale-[0.99] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
            >
              {allEligibleDone ? <Plus className="w-4 h-4" /> : phaseMeta[primaryPhase].icon}
              <span>{allEligibleDone ? 'Etwas festhalten' : isCatchUp ? 'Jetzt nachholen' : 'Check-in starten'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-stone-200 bg-white overflow-hidden shadow-sm" aria-labelledby="day-journey-title">
        <div className="px-5 sm:px-6 pt-5 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">Dein Tagesweg</p>
              <h2 id="day-journey-title" className="mt-1 font-display text-lg font-bold text-stone-950">Drei Momente, ein klarer Rhythmus</h2>
            </div>
            <span className="text-xs font-semibold text-stone-500">{completedCount}/3</span>
          </div>
        </div>

        <div className="divide-y divide-stone-100">
          {(['morning', 'midday', 'evening'] as TimeOfDayPhase[]).map((phase) => {
            const done = completed[phase];
            const phaseIndex = phase === 'morning' ? 0 : phase === 'midday' ? 1 : 2;
            const currentIndex = currentPhase === 'morning' ? 0 : currentPhase === 'midday' ? 1 : 2;
            const isPastAndMissing = phaseIndex < currentIndex && !done;
            const isCurrentAndMissing = phase === currentPhase && !done;
            const isFuture = phaseIndex > currentIndex;

            return (
              <button
                type="button"
                key={phase}
                onClick={done ? onNavigateToTimeline : isFuture ? undefined : onOpenCheckInModal}
                disabled={isFuture}
                className="w-full px-5 sm:px-6 py-4 flex items-center gap-4 text-left disabled:cursor-default hover:bg-stone-50/70 disabled:hover:bg-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-stone-900"
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${done ? 'bg-emerald-100 text-emerald-700' : isPastAndMissing || isCurrentAndMissing ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-400'}`}>
                  {done ? <Check className="w-5 h-5" /> : phaseMeta[phase].icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-stone-900">{phaseMeta[phase].label}</h3>
                    {done && <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">Erledigt</span>}
                    {isPastAndMissing && <span className="text-[10px] font-bold uppercase tracking-wide text-amber-800">Fehlt</span>}
                    {isCurrentAndMissing && <span className="text-[10px] font-bold uppercase tracking-wide text-amber-800">Jetzt</span>}
                  </div>
                  <p className="mt-0.5 text-xs sm:text-sm text-stone-500">{phaseMeta[phase].eyebrow}</p>
                </div>
                {done || isPastAndMissing || isCurrentAndMissing ? <ChevronRight className="w-4 h-4 text-stone-400" /> : <Circle className="w-3.5 h-3.5 text-stone-300" />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[28px] border border-stone-200 bg-[#F4F1EA] p-5 sm:p-6">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-stone-800 shrink-0">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">Cary bemerkt</p>
            <h2 className="mt-1 font-display text-lg font-bold text-stone-950">
              {nutritionProfile.unlocked ? 'Ein Muster wird sichtbar' : 'Noch keine vorschnellen Schlüsse'}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{learningText}</p>
            <button type="button" onClick={onNavigateToTypeAnalysis} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-stone-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 rounded-md">
              <span>Dein Muster ansehen</span><ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-stone-200 bg-white p-5 sm:p-6 shadow-sm" aria-labelledby="recent-title">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">Heute festgehalten</p>
            <h2 id="recent-title" className="mt-1 font-display text-lg font-bold text-stone-950">Deine Einträge</h2>
          </div>
          <button type="button" onClick={onNavigateToTimeline} className="inline-flex items-center gap-1 text-xs font-bold text-stone-600 hover:text-stone-900">
            Verlauf <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayMoments.length > 0 ? (
          <div className="mt-4 space-y-2.5">
            {todayMoments.map((moment) => (
              <button type="button" key={moment.id} onClick={() => onSelectMoment(moment)} className="w-full flex items-center gap-3 rounded-2xl border border-stone-200 p-2.5 text-left hover:bg-stone-50 transition-colors">
                <img src={moment.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-stone-500">{moment.label} · {moment.time}</p>
                  <p className="mt-0.5 text-sm font-bold text-stone-900 truncate">{moment.title}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-stone-50 border border-dashed border-stone-300 px-4 py-5 text-center">
            <p className="text-sm font-semibold text-stone-700">Noch keine Mahlzeit separat gespeichert.</p>
            <button type="button" onClick={onOpenAddModal} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white border border-stone-200 px-4 py-2 text-xs font-bold text-stone-800 hover:bg-stone-100"><Plus className="w-4 h-4" />Mahlzeit hinzufügen</button>
          </div>
        )}
      </section>

      <section className="grid grid-cols-3 gap-2.5">
        <button type="button" onClick={onNavigateToTypeAnalysis} className="rounded-2xl border border-stone-200 bg-white px-3 py-4 text-center hover:bg-stone-50 transition-colors">
          <Sparkles className="w-4 h-4 mx-auto text-stone-700" />
          <span className="mt-1.5 block text-xs font-bold text-stone-800">Muster</span>
        </button>
        <button type="button" onClick={onNavigateToCoach} className="rounded-2xl border border-stone-200 bg-white px-3 py-4 text-center hover:bg-stone-50 transition-colors">
          <MessageCircle className="w-4 h-4 mx-auto text-stone-700" />
          <span className="mt-1.5 block text-xs font-bold text-stone-800">Cary</span>
        </button>
        <button type="button" onClick={onNavigateToTimeline} className="rounded-2xl border border-stone-200 bg-white px-3 py-4 text-center hover:bg-stone-50 transition-colors">
          <History className="w-4 h-4 mx-auto text-stone-700" />
          <span className="mt-1.5 block text-xs font-bold text-stone-800">Verlauf</span>
        </button>
      </section>

      <details className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">
        <summary className="cursor-pointer list-none flex items-center justify-between gap-3 font-semibold text-stone-700">
          <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" />Deine Daten</span>
          <Clock3 className="w-4 h-4 text-stone-400" />
        </summary>
        <div className="pt-3 text-xs leading-relaxed border-t border-stone-100 mt-3">
          <p>Tagebuch und Check-ins bleiben in diesem Browser gespeichert. Für einzelne Cary-AI-Funktionen können die dafür nötigen Inhalte an den AI-Dienst gesendet werden.</p>
          <button type="button" onClick={() => downloadCaryDataExport(moments, checkIns)} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-bold text-stone-700 hover:bg-stone-100"><Download className="w-4 h-4" />Daten exportieren</button>
        </div>
      </details>
    </div>
  );
};
