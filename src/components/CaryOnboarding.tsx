import React from 'react';
import { ArrowRight, Brain, Check, HeartPulse, MoonStar, Sparkles, Utensils } from 'lucide-react';

const KEY = 'cary_onboarding_v2_complete';

type Focus = 'energy' | 'sleep' | 'food' | 'understand';

interface Props { children: React.ReactNode; }

export const CaryOnboarding: React.FC<Props> = ({ children }) => {
  const [done, setDone] = React.useState(() => localStorage.getItem(KEY) === 'true');
  const [step, setStep] = React.useState(0);
  const [focus, setFocus] = React.useState<Focus>('understand');

  const finish = () => {
    localStorage.setItem(KEY, 'true');
    localStorage.setItem('cary_onboarding_focus_v1', focus);
    setDone(true);
  };

  if (done) return <>{children}</>;

  const focuses: Array<{ id: Focus; label: string; sub: string; icon: React.ReactNode }> = [
    { id: 'energy', label: 'Mehr über meine Energie verstehen', sub: 'Wann du dich wach, müde oder ausgeglichen fühlst.', icon: <HeartPulse className="w-5 h-5" /> },
    { id: 'sleep', label: 'Schlaf & Alltag verbinden', sub: 'Was nach guten und kurzen Nächten bei dir anders ist.', icon: <MoonStar className="w-5 h-5" /> },
    { id: 'food', label: 'Mein Essverhalten verstehen', sub: 'Hunger, Sättigung, Rhythmus und Essen ohne Kalorienzwang.', icon: <Utensils className="w-5 h-5" /> },
    { id: 'understand', label: 'Mich insgesamt besser verstehen', sub: 'Cary schaut auf Essen, Schlaf und Befinden zusammen.', icon: <Brain className="w-5 h-5" /> },
  ];

  return <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#FFF7EF] text-[#34251E]">
    <div className="min-h-full max-w-xl mx-auto px-5 py-8 sm:py-12 flex flex-col">
      <div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><div className="w-10 h-10 rounded-2xl bg-[#E86F45] text-white grid place-items-center font-display font-black">C</div><strong className="font-display text-xl">Cary</strong></div><span className="text-xs font-bold text-[#9A7664]">{step + 1}/3</span></div>
      <div className="mt-6 h-1.5 rounded-full bg-[#EADDD2] overflow-hidden"><div className="h-full bg-[#E86F45] transition-all" style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>

      <div className="flex-1 flex flex-col justify-center py-10">
        {step === 0 && <><p className="text-xs font-black uppercase tracking-[.16em] text-[#B56040]">Damit Cary zu dir passt</p><h1 className="mt-3 text-4xl sm:text-5xl font-display font-black leading-tight">Was möchtest du besser verstehen?</h1><p className="mt-3 text-[#7F6254]">Keine Sorge: Das ist kein Zielvertrag. Es hilft Cary nur, am Anfang die richtigen Dinge hervorzuheben.</p><div className="mt-7 space-y-3">{focuses.map(item => <button key={item.id} onClick={() => setFocus(item.id)} className={`w-full rounded-[24px] p-4 text-left border flex items-center gap-4 transition ${focus === item.id ? 'bg-[#34251E] text-white border-[#34251E]' : 'bg-white border-[#E7D8CC]'}`}><span className={`w-11 h-11 rounded-2xl grid place-items-center ${focus === item.id ? 'bg-white/12' : 'bg-[#FCE8DA] text-[#B45F3E]'}`}>{item.icon}</span><span className="flex-1"><strong className="block">{item.label}</strong><span className={`block mt-1 text-xs ${focus === item.id ? 'text-white/65' : 'text-[#8C6D5D]'}`}>{item.sub}</span></span>{focus === item.id && <Check className="w-5 h-5" />}</button>)}</div></>}

        {step === 1 && <><div className="w-14 h-14 rounded-[20px] bg-[#F2B55F] grid place-items-center text-[#4B3122]"><Sparkles className="w-7 h-7" /></div><h1 className="mt-6 text-4xl sm:text-5xl font-display font-black leading-tight">Du pflegst keine Datenbank.</h1><p className="mt-4 text-lg leading-relaxed text-[#76594B]">Du hältst nur kurz fest, was passiert. Ein Essen, ein Satz an Cary oder ein paar Taps. Cary ordnet im Hintergrund Schlaf, Essen und Befinden zusammen.</p><div className="mt-7 rounded-[28px] bg-[#263C32] p-5 text-white"><p className="text-xs font-black uppercase tracking-[.15em] text-[#BFD4C3]">Das Prinzip</p><div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold"><div className="rounded-2xl bg-white/10 px-2 py-4">Festhalten</div><div className="rounded-2xl bg-white/10 px-2 py-4">Cary lernt</div><div className="rounded-2xl bg-white/10 px-2 py-4">Muster sehen</div></div></div></>}

        {step === 2 && <><div className="w-14 h-14 rounded-[20px] bg-[#E86F45] text-white grid place-items-center"><ArrowRight className="w-7 h-7" /></div><h1 className="mt-6 text-4xl sm:text-5xl font-display font-black leading-tight">Beginnen wir mit heute.</h1><p className="mt-4 text-lg leading-relaxed text-[#76594B]">Cary zeigt dir immer nur den nächsten sinnvollen Schritt. Morgens geht es eher um Schlaf und Start in den Tag, mittags um Essen und Energie, abends um den Rückblick.</p><div className="mt-7 rounded-[28px] border border-[#E6D7CA] bg-white p-5"><strong>Gut zu wissen</strong><p className="mt-2 text-sm leading-relaxed text-[#806354]">Cary formuliert Beobachtungen vorsichtig. Ein einzelner Tag ist noch kein Muster. Je mehr echte Alltagseinträge entstehen, desto hilfreicher werden die Zusammenhänge.</p></div></>}
      </div>

      <button onClick={() => step < 2 ? setStep(step + 1) : finish()} className="w-full rounded-2xl bg-[#E86F45] text-white py-4 font-black flex items-center justify-center gap-2 shadow-[0_12px_30px_rgba(232,111,69,.25)]">{step < 2 ? 'Weiter' : 'Cary öffnen'}<ArrowRight className="w-4 h-4" /></button>
    </div>
  </div>;
};
