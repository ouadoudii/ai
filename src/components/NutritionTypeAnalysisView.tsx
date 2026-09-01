import React from 'react';
import { ArrowRight, CheckCircle2, FlaskConical, Layers3, Plus, ShieldCheck, Sparkles } from 'lucide-react';
import { FoodMoment, DailyCheckIn } from '../types';
import { buildPatternInsights, CaryPatternInsight } from '../utils/patternInsights';

interface NutritionTypeAnalysisViewProps {
  moments: FoodMoment[];
  checkIns: DailyCheckIn[];
  onOpenCheckIn: () => void;
  onOpenAddMoment: () => void;
}

const confidenceStyle: Record<CaryPatternInsight['confidence'], string> = {
  Hinweis: 'bg-[#F2E9DF] text-[#7B5E4D]',
  Tendenz: 'bg-[#F8DFAE] text-[#74501F]',
  Muster: 'bg-[#DCEBDD] text-[#2F6244]',
};

const confidenceCopy: Record<CaryPatternInsight['confidence'], string> = {
  Hinweis: 'Erste Beobachtung – noch keine belastbare Aussage.',
  Tendenz: 'Mehrfach gesehen – weiter beobachten.',
  Muster: 'Über mehrere Situationen wiederholt gesehen.',
};

export const NutritionTypeAnalysisView: React.FC<NutritionTypeAnalysisViewProps> = ({ moments, checkIns, onOpenCheckIn, onOpenAddMoment }) => {
  const insights = React.useMemo(() => buildPatternInsights(moments, checkIns), [moments, checkIns]);
  const realMomentCount = moments.filter((m) => !/^moment-\d{1,2}$/.test(m.id)).length;
  const realCheckCount = checkIns.filter((c) => !/^checkin-\d{1,2}$/.test(c.id)).length;
  const realDataPoints = realMomentCount + realCheckCount;
  const patternCount = insights.filter((item) => item.confidence === 'Muster').length;
  const tendencyCount = insights.filter((item) => item.confidence === 'Tendenz').length;

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-200">
      <section className="pt-3 sm:pt-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#E3EFE4] px-3 py-1.5 text-[11px] font-black uppercase tracking-[.14em] text-[#3F6D4D]"><Sparkles className="w-3.5 h-3.5" />Entdecken</div>
        <h1 className="mt-4 text-4xl sm:text-6xl font-display font-black tracking-tight text-[#31221C]">Was hängt bei dir zusammen?</h1>
        <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-[#755B4E]">Cary vergleicht wiederkehrende Alltagssituationen. Keine Diagnose, kein starrer Typ – sondern vorsichtige Beobachtungen, die mit deinen Daten stärker oder schwächer werden.</p>
      </section>

      <section className="mt-7 grid grid-cols-3 gap-3">
        <div className="rounded-[24px] bg-[#FFF4E8] border border-[#F1DDCC] p-4"><span className="text-2xl font-display font-black text-[#563A2C]">{realDataPoints}</span><span className="block mt-1 text-[11px] font-bold text-[#8C6A58]">echte Datenpunkte</span></div>
        <div className="rounded-[24px] bg-[#FFF6DB] border border-[#F2E4B6] p-4"><span className="text-2xl font-display font-black text-[#5A4321]">{tendencyCount}</span><span className="block mt-1 text-[11px] font-bold text-[#8A7043]">Tendenzen</span></div>
        <div className="rounded-[24px] bg-[#EAF3E9] border border-[#D4E5D3] p-4"><span className="text-2xl font-display font-black text-[#31553B]">{patternCount}</span><span className="block mt-1 text-[11px] font-bold text-[#607B65]">stärkere Muster</span></div>
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-xs font-black uppercase tracking-[.15em] text-[#A76042]">Deine Karten</p><h2 className="mt-1 text-2xl sm:text-3xl font-display font-black text-[#31221C]">Cary beobachtet</h2></div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[#806354]"><Layers3 className="w-4 h-4" />Hinweis → Tendenz → Muster</div>
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-4">
          {insights.map((insight, index) => (
            <article key={insight.id} className={`rounded-[30px] border p-5 sm:p-6 ${index === 0 ? 'bg-[#2D4035] border-[#2D4035] text-white md:col-span-2' : 'bg-white border-[#E6D9CE] text-[#38271F]'} shadow-sm`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] ${index === 0 ? 'bg-white/12 text-[#E7F2E6]' : confidenceStyle[insight.confidence]}`}>{insight.confidence}</span>
                  <h3 className={`mt-3 text-xl sm:text-2xl font-display font-black ${index === 0 ? 'text-white' : 'text-[#35251E]'}`}>{insight.title}</h3>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${index === 0 ? 'bg-white/10 text-white/75' : 'bg-[#F7F0EA] text-[#856958]'}`}>{insight.evidenceCount} Beobachtungen</span>
              </div>

              <div className={`mt-5 rounded-[22px] p-4 ${index === 0 ? 'bg-white/8' : 'bg-[#FFF8F1]'}`}>
                <p className={`text-[10px] font-black uppercase tracking-[.13em] ${index === 0 ? 'text-[#BFD5C3]' : 'text-[#A16A4E]'}`}>Was Cary sieht</p>
                <p className={`mt-2 text-sm leading-relaxed ${index === 0 ? 'text-white/85' : 'text-[#665044]'}`}>{insight.observation}</p>
              </div>

              <div className="mt-4 flex items-start gap-3">
                <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${index === 0 ? 'bg-[#F0B45E] text-[#3E2A1D]' : 'bg-[#F6E3C2] text-[#7C592B]'}`}><FlaskConical className="w-4 h-4" /></div>
                <div><p className={`text-[10px] font-black uppercase tracking-[.13em] ${index === 0 ? 'text-[#BFD5C3]' : 'text-[#A16A4E]'}`}>Was du ausprobieren kannst</p><p className={`mt-1 text-sm leading-relaxed ${index === 0 ? 'text-white/78' : 'text-[#665044]'}`}>{insight.experiment}</p></div>
              </div>

              <div className={`mt-5 pt-4 border-t text-[11px] flex items-center gap-2 ${index === 0 ? 'border-white/10 text-white/55' : 'border-[#EFE2D7] text-[#8B7163]'}`}><ShieldCheck className="w-3.5 h-3.5" />{confidenceCopy[insight.confidence]}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-[30px] bg-[#F2B55F] p-5 sm:p-7 text-[#432B1D] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="max-w-xl"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.14em]"><CheckCircle2 className="w-4 h-4" />Bessere Muster brauchen Alltag</div><h2 className="mt-2 text-2xl font-display font-black">Nicht mehr tracken. Nur regelmäßig festhalten.</h2><p className="mt-2 text-sm text-[#6C4B32]">Cary lernt am besten aus normalen Tagen – nicht aus perfekten Tagen und nicht aus möglichst vielen Feldern.</p></div>
        <div className="flex gap-2 shrink-0"><button onClick={onOpenCheckIn} className="rounded-full bg-[#3B2A22] text-white px-4 py-3 text-xs font-black inline-flex items-center gap-2"><Plus className="w-4 h-4" />Festhalten</button><button onClick={onOpenAddMoment} className="rounded-full bg-white/55 px-4 py-3 text-xs font-black inline-flex items-center gap-2">Essen <ArrowRight className="w-4 h-4" /></button></div>
      </section>
    </div>
  );
};
