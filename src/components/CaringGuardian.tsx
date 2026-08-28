import React from 'react';
import { 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Zap, 
  Moon, 
  Utensils, 
  Coffee, 
  Dna,
  Smile,
  ShieldCheck
} from 'lucide-react';
import { NutritionAlarm, GuardianStatus } from '../utils/interventionEngine';
import { NutritionArchetype } from '../types';

interface CaringGuardianProps {
  guardianStatus: GuardianStatus;
  userArchetype: NutritionArchetype;
}

export const CaringGuardian: React.FC<CaringGuardianProps> = ({
  guardianStatus,
  userArchetype,
}) => {
  const [resolvedAlarmIds, setResolvedAlarmIds] = React.useState<string[]>([]);

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

  // If no red flags or all resolved, show a warm, caring affirmation
  if (activeUnresolvedAlarms.length === 0) {
    return (
      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Heart className="w-5 h-5 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-950">
                Alles im grünen Bereich • Cary wacht fürsorglich über deinen Tag
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 hidden sm:inline-block">
                Typ: {getArchetypeName(userArchetype)}
              </span>
            </div>
            <p className="text-xs text-emerald-800/90 mt-0.5">
              Dein Rhythmus aus Schlaf, Essen und Energie ist harmonisch. Ich passe im Hintergrund auf dich auf.
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 border border-emerald-200 text-xs font-semibold text-emerald-800 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Für dich da</span>
        </div>
      </div>
    );
  }

  // Active caring impulse cards
  return (
    <div className="space-y-3">
      {activeUnresolvedAlarms.map((alarm) => (
        <div
          key={alarm.id}
          className="rounded-3xl p-5 bg-gradient-to-r from-amber-500/10 via-white to-amber-500/5 border border-amber-500/30 shadow-xs space-y-3 transition-all"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Heart className="w-4 h-4 fill-white" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    Sanfter Tagesimpuls für dich
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {alarm.timestamp}
                  </span>
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  {alarm.title.replace('⚠️', '💛')}
                </h3>
                <p className="text-xs text-stone-600">
                  {alarm.subtitle}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleResolve(alarm.id)}
              className="px-3.5 py-2 bg-white hover:bg-stone-50 active:scale-95 text-stone-700 text-xs font-bold rounded-xl border border-stone-200 shadow-xs flex items-center gap-1.5 transition-all shrink-0 self-end sm:self-center"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Danke, erledigt</span>
            </button>
          </div>

          {/* Caring Explanation & Tip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2 border-t border-stone-200/60 text-xs">
            <div className="bg-white/80 rounded-2xl p-3 border border-stone-200/60">
              <span className="font-bold text-stone-800 flex items-center gap-1 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Warum ich mich melde:
              </span>
              <p className="text-stone-600 leading-relaxed">
                {alarm.reason}
              </p>
            </div>

            <div className="bg-emerald-50/80 rounded-2xl p-3 border border-emerald-200/80">
              <span className="font-bold text-emerald-950 flex items-center gap-1 mb-1">
                <Smile className="w-3.5 h-3.5 text-emerald-700" /> Mein Rat für deinen Typ:
              </span>
              <p className="text-emerald-900 leading-relaxed font-medium">
                {alarm.recommendation}
              </p>
            </div>
          </div>

          {/* Quick Immediate Step */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-stone-900 text-white rounded-2xl text-xs">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold">Sofort-Tipp:</span>
              <span className="text-stone-200">{alarm.actionableStep}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
};
