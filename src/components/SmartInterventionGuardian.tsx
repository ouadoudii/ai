import React from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Zap, 
  Moon, 
  Utensils, 
  Coffee, 
  Dna,
  RefreshCw
} from 'lucide-react';
import { NutritionAlarm, GuardianStatus } from '../utils/interventionEngine';
import { NutritionArchetype } from '../types';

interface SmartInterventionGuardianProps {
  guardianStatus: GuardianStatus;
  userArchetype: NutritionArchetype;
  onSimulateAlarm?: (scenario: 'sleep' | 'rushed_meal' | 'afternoon_crash' | 'clear') => void;
  isSimulated?: boolean;
}

export const SmartInterventionGuardian: React.FC<SmartInterventionGuardianProps> = ({
  guardianStatus,
  userArchetype,
  onSimulateAlarm,
  isSimulated = false,
}) => {
  const [resolvedAlarmIds, setResolvedAlarmIds] = React.useState<string[]>([]);
  const [showSimulator, setShowSimulator] = React.useState(false);

  const activeUnresolvedAlarms = guardianStatus.activeAlarms.filter(
    (a) => !resolvedAlarmIds.includes(a.id)
  );

  const handleResolve = (alarmId: string) => {
    setResolvedAlarmIds((prev) => [...prev, alarmId]);
  };

  const getArchetypeName = (type: NutritionArchetype) => {
    switch (type) {
      case 'protein_performer': return 'Protein-Performer';
      case 'circadian_rhythm': return 'Circadianer Rhythmus-Typ';
      case 'intermittent_balancer': return 'Intervall-Stratege';
      default: return 'Intuitiver Genießer';
    }
  };

  return (
    <section className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs relative overflow-hidden transition-all">
      {/* Header bar of the Guardian */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl flex items-center justify-center ${
            activeUnresolvedAlarms.length > 0
              ? 'bg-rose-500 text-white shadow-xs animate-pulse'
              : 'bg-emerald-500 text-white shadow-xs'
          }`}>
            {activeUnresolvedAlarms.length > 0 ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-display font-bold text-stone-900 leading-tight">
                Cary Fürsorge- & Frühwarn-System
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                Typ: {getArchetypeName(userArchetype)}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Passt auf dich auf und gibt sanfte Impulse bei messbaren physiologischen Warnsignalen.
            </p>
          </div>
        </div>

        {/* Live Status indicator & Simulator toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
            activeUnresolvedAlarms.length > 0
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              activeUnresolvedAlarms.length > 0 ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'
            }`} />
            <span>
              {activeUnresolvedAlarms.length > 0
                ? `${activeUnresolvedAlarms.length} Alarm aktiv`
                : 'Alles im grünen Bereich'}
            </span>
          </div>

          {onSimulateAlarm && (
            <button
              onClick={() => setShowSimulator(!showSimulator)}
              className="text-[11px] font-semibold px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Alarm testen</span>
            </button>
          )}
        </div>
      </div>

      {/* Simulator Drawer (for demonstrating the conditional red flags) */}
      {showSimulator && onSimulateAlarm && (
        <div className="mt-4 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
              🧪 Alarm-Szenarien simulieren (Test-Modus)
            </span>
            <span className="text-[10px] text-stone-400">Reagiert nach Ernährungstyp</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => onSimulateAlarm('sleep')}
              className="p-2 text-left rounded-xl bg-white border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all text-xs"
            >
              <span className="font-bold text-stone-800 flex items-center gap-1">
                <Moon className="w-3 h-3 text-indigo-500" /> Schlafmangel
              </span>
              <span className="text-[10px] text-stone-500 block mt-0.5">5.0h & Ghrelin-Hoch</span>
            </button>

            <button
              onClick={() => onSimulateAlarm('rushed_meal')}
              className="p-2 text-left rounded-xl bg-white border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all text-xs"
            >
              <span className="font-bold text-stone-800 flex items-center gap-1">
                <Utensils className="w-3 h-3 text-rose-500" /> Stress-Essen
              </span>
              <span className="text-[10px] text-stone-500 block mt-0.5">Gehetzt am Handy</span>
            </button>

            <button
              onClick={() => onSimulateAlarm('afternoon_crash')}
              className="p-2 text-left rounded-xl bg-white border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all text-xs"
            >
              <span className="font-bold text-stone-800 flex items-center gap-1">
                <Coffee className="w-3 h-3 text-amber-500" /> 14-Uhr Tief
              </span>
              <span className="text-[10px] text-stone-500 block mt-0.5">Energie Stufe 1/5</span>
            </button>

            <button
              onClick={() => {
                onSimulateAlarm('clear');
                setResolvedAlarmIds([]);
              }}
              className="p-2 text-left rounded-xl bg-white border border-emerald-200 hover:bg-emerald-50 text-xs"
            >
              <span className="font-bold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Reset (Grün)
              </span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">Keine Warnsignale</span>
            </button>
          </div>
        </div>
      )}

      {/* BODY CONTENT: Conditional rendering based on alarms */}
      <div className="mt-4">
        {activeUnresolvedAlarms.length === 0 ? (
          /* CALM GREEN STATE - NO INTERVENTION REQUIRED */
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 font-bold">
                ✓
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-emerald-950">
                  Keine Intervention erforderlich
                </h3>
                <p className="text-xs text-emerald-800/90 leading-relaxed">
                  Schlaf, Mahlzeiten-Rhythmus und Energie befinden sich im optimalen Gleichgewicht. NimmApp hält sich dezent im Hintergrund und beobachtet weiter.
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-3 py-1.5 rounded-xl shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Guardian Aktiv</span>
            </div>
          </div>
        ) : (
          /* ACTIVE INTERVENTION CARDS (RED / AMBER ALARMS) */
          <div className="space-y-3">
            {activeUnresolvedAlarms.map((alarm) => (
              <div
                key={alarm.id}
                className={`rounded-2xl p-4 sm:p-5 border transition-all ${
                  alarm.severity === 'high'
                    ? 'bg-rose-50/80 border-rose-200 shadow-xs'
                    : 'bg-amber-50/80 border-amber-200 shadow-xs'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        alarm.severity === 'high'
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-600 text-white'
                      }`}>
                        {alarm.severity === 'high' ? 'Akute Intervention' : 'Empfehlung'}
                      </span>
                      <span className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {alarm.timestamp}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-stone-900">
                      {alarm.title}
                    </h3>
                    <p className="text-xs text-stone-600 font-medium">
                      {alarm.subtitle}
                    </p>
                  </div>

                  <button
                    onClick={() => handleResolve(alarm.id)}
                    className="px-4 py-2 bg-white hover:bg-stone-50 active:scale-95 text-stone-800 text-xs font-bold rounded-xl border border-stone-200 shadow-xs flex items-center gap-1.5 transition-all shrink-0 self-end md:self-center"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Als erledigt abhaken</span>
                  </button>
                </div>

                {/* Root Cause & Archetype specific Counter-Action */}
                <div className="mt-3.5 pt-3 border-t border-stone-200/60 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/80 rounded-xl p-3 border border-stone-200/60">
                    <span className="font-bold text-stone-700 flex items-center gap-1 mb-1">
                      <Zap className="w-3.5 h-3.5 text-amber-600" /> Warum greift NimmApp ein?
                    </span>
                    <p className="text-stone-600 leading-relaxed">
                      {alarm.reason}
                    </p>
                  </div>

                  <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
                    <span className="font-bold text-emerald-950 flex items-center gap-1 mb-1">
                      <Dna className="w-3.5 h-3.5 text-emerald-700" /> Typ-Gegenmaßnahme ({getArchetypeName(alarm.archetype)})
                    </span>
                    <p className="text-emerald-900 leading-relaxed font-medium">
                      {alarm.recommendation}
                    </p>
                  </div>
                </div>

                {/* Immediate Action step */}
                <div className="mt-2.5 flex items-center justify-between px-3 py-2 bg-stone-900 text-white rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">Sofort-Schritt:</span>
                    <span className="text-stone-200">{alarm.actionableStep}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
