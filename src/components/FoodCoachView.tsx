import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  Eye, 
  Send, 
  MessageSquare, 
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Brain,
  Star,
  Mic,
  Dna,
  Moon,
  Sun,
  Utensils
} from 'lucide-react';
import { FoodMoment, CoachingGoal, CoachChatMessage, DailyCheckIn } from '../types';
import { 
  calculateCoachingMetrics, 
  INITIAL_COACHING_GOALS, 
  getCoachChatResponse 
} from '../utils/coachEngine';
import { analyzeNutritionType } from '../utils/nutritionTypeEngine';
import { evaluateNutritionAlarms, GuardianStatus } from '../utils/interventionEngine';
import { SmartInterventionGuardian } from './SmartInterventionGuardian';
import { askGeminiCoach } from '../apiClient';

interface FoodCoachViewProps {
  moments: FoodMoment[];
  checkIns?: DailyCheckIn[];
  onOpenAddModal: () => void;
  onOpenCheckInModal?: () => void;
  onSelectMoment: (moment: FoodMoment) => void;
  onNavigateToTimeline?: () => void;
  onNavigateToTypeAnalysis?: () => void;
}

export const FoodCoachView: React.FC<FoodCoachViewProps> = ({
  moments,
  checkIns = [],
  onOpenAddModal,
  onOpenCheckInModal,
  onSelectMoment,
  onNavigateToTimeline,
  onNavigateToTypeAnalysis,
}) => {
  const metrics = React.useMemo(() => calculateCoachingMetrics(moments), [moments]);
  const nutritionProfile = React.useMemo(() => analyzeNutritionType(moments, checkIns), [moments, checkIns]);
  const [goals, setGoals] = React.useState<CoachingGoal[]>(INITIAL_COACHING_GOALS);
  const [simulatedScenario, setSimulatedScenario] = React.useState<'sleep' | 'rushed_meal' | 'afternoon_crash' | null>(null);

  // Dynamic Guardian evaluation based on real logs + active simulation
  const effectiveMoments = React.useMemo(() => {
    if (simulatedScenario === 'rushed_meal') {
      return [
        {
          id: 'sim-rushed-1',
          title: 'Schnelles Pastagericht vorm Bildschirm',
          label: 'Mittagessen',
          category: 'lunch' as const,
          date: 'Heute',
          time: '12:45',
          location: 'Schreibtisch',
          locationCategory: 'work' as const,
          imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=80',
          rating: 3,
          mood: 'stressed' as const,
          hungerLevel: 4,
          fullnessLevel: 5,
          eatingPace: 'rushed' as const,
          distraction: 'screen' as const,
          energyAfter: 'sluggish' as const,
          notes: 'Unter Zeitdruck gegessen.',
          tags: ['Simuliert', 'Stress'],
          createdAt: Date.now(),
        },
        ...moments,
      ];
    }
    return moments;
  }, [moments, simulatedScenario]);

  const effectiveCheckIns = React.useMemo(() => {
    if (simulatedScenario === 'sleep') {
      return [
        {
          id: 'sim-sleep-1',
          date: 'Heute',
          time: '07:00',
          timeOfDay: 'morning' as const,
          sleep: {
            durationHours: 5.0,
            quality: 2,
            wakeFeeling: 'exhausted' as const,
          },
          wellbeing: {
            energyLevel: 2,
            mood: 'stressed' as const,
            stressLevel: 4,
            waterGlasses: 1,
            note: 'Sehr unruhig geschlafen, spät ins Bett.',
          },
          createdAt: Date.now(),
        },
        ...checkIns,
      ];
    }
    if (simulatedScenario === 'afternoon_crash') {
      return [
        {
          id: 'sim-crash-1',
          date: 'Heute',
          time: '14:30',
          timeOfDay: 'midday' as const,
          wellbeing: {
            energyLevel: 1,
            mood: 'sluggish' as const,
            stressLevel: 3,
            waterGlasses: 2,
            note: 'Extremes Nachmittagstief nach dem Mittagessen.',
          },
          createdAt: Date.now(),
        },
        ...checkIns,
      ];
    }
    return checkIns;
  }, [checkIns, simulatedScenario]);

  const guardianStatus: GuardianStatus = React.useMemo(() => {
    return evaluateNutritionAlarms(effectiveMoments, effectiveCheckIns, nutritionProfile.archetype);
  }, [effectiveMoments, effectiveCheckIns, nutritionProfile.archetype]);

  const handleSimulateAlarm = (scenario: 'sleep' | 'rushed_meal' | 'afternoon_crash' | 'clear') => {
    if (scenario === 'clear') {
      setSimulatedScenario(null);
    } else {
      setSimulatedScenario(scenario);
    }
  };

  const currentHour = new Date().getHours();
  const timeGreeting =
    currentHour >= 5 && currentHour < 11
      ? 'Guten Morgen'
      : currentHour >= 11 && currentHour < 16
      ? 'Guten Mittag'
      : 'Guten Abend';
  
  // Interactive Coach Chat State
  const [chatMessages, setChatMessages] = React.useState<CoachChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'coach',
      text: `Hallo! ${timeGreeting}! Ich bin Cary, deine fürsorgliche Begleiterin. Ich passe auf dein Zusammenspiel aus Schlaf, Mahlzeiten und Wohlbefinden auf. Wie kann ich dir jetzt guttun?`,
      timestamp: 'Heute',
      suggestions: [
        '📊 Welcher Ernährungstyp bin ich?',
        '🛡️ Welche Frühwarnzeichen überwacht Cary?',
        '🎙️ Sprach-Check-in starten',
        '⚡ Wie vermeide ich das Nachmittagstief?',
      ],
    },
  ]);
  const [inputQuery, setInputQuery] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  const toggleGoal = (goalId: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const nextCompleted = !g.completed;
          return {
            ...g,
            completed: nextCompleted,
            current: nextCompleted ? g.target : Math.max(0, g.target - 1),
          };
        }
        return g;
      })
    );
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputQuery.trim();
    if (!query) return;

    if (query.includes('Sprach-Check-in') && onOpenCheckInModal) {
      onOpenCheckInModal();
      return;
    }

    if (query.includes('Ernährungstyp') && onNavigateToTypeAnalysis) {
      onNavigateToTypeAnalysis();
      return;
    }

    const userMsg: CoachChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    askGeminiCoach(query, moments, checkIns, nutritionProfile.archetype)
      .then((reply) => {
        const coachMsg: CoachChatMessage = {
          id: `coach-${Date.now()}`,
          sender: 'coach',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages((prev) => [...prev, coachMsg]);
      })
      .catch((err) => {
        console.error('Coach reply error:', err);
        const fallbackReply = getCoachChatResponse(query, moments);
        const coachMsg: CoachChatMessage = {
          id: `coach-${Date.now()}`,
          sender: 'coach',
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages((prev) => [...prev, coachMsg]);
      })
      .finally(() => {
        setIsTyping(false);
      });
  };

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Daily Check-in & WhatsApp Voice Trigger Card */}
      <section className="bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-stone-50 rounded-3xl p-5 sm:p-6 border border-emerald-500/30 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-lg">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#25D366] text-white flex items-center gap-1 shadow-xs">
              <Mic className="w-3 h-3 stroke-[2.5]" />
              <span>Voice Check-in</span>
            </span>
            <span className="text-xs font-semibold text-stone-500">
              {currentHour < 11 ? 'Morgen-Rhythmus' : currentHour < 16 ? 'Mittags-Fokus' : 'Abend-Reflexion'}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-display font-bold text-stone-900 leading-tight">
            Wie war dein Tag bisher? Dokumentiere Schlaf, Essen & Wohlbefinden
          </h2>
          <p className="text-xs text-stone-600">
            Beantworte die kurze Tagesbefragung oder sprich einfach frei ins Mikrofon.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={onOpenCheckInModal}
            className="flex-1 sm:flex-none px-5 py-3 bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all ring-3 ring-emerald-500/20"
          >
            <Mic className="w-4 h-4 stroke-[2.5]" />
            <span>Check-in starten</span>
          </button>
        </div>
      </section>

      {/* 2. Smart Intervention Guardian: Greift nur bei messbaren Alarmzeichen ein */}
      <SmartInterventionGuardian
        guardianStatus={guardianStatus}
        userArchetype={nutritionProfile.archetype}
        onSimulateAlarm={handleSimulateAlarm}
        isSimulated={simulatedScenario !== null}
      />

      {/* 3. Top Welcome Hero & Ernährungstyp Quick Banner */}
      <section className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Cary • Fürsorgliche Begleitung für Körper & Geist</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 leading-tight">
              Achtsamkeit. Schlaf. Wohlbefinden.
            </h1>
            
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {metrics.coachSummary}
            </p>
          </div>

          {/* Ernährungstyp Quick Status Card */}
          <div 
            onClick={onNavigateToTypeAnalysis}
            className="w-full md:w-auto bg-stone-50 hover:bg-amber-50/60 transition-colors cursor-pointer rounded-2xl p-4 border border-stone-200/80 flex items-center justify-between md:justify-center gap-4 shrink-0 group"
          >
            <div className="p-3 bg-amber-500 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform">
              <Dna className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                Dein Ernährungstyp
              </span>
              <span className="text-sm sm:text-base font-bold text-stone-900 block leading-tight">
                {nutritionProfile.typeName}
              </span>
              <span className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5 group-hover:text-amber-800 font-medium">
                <span>Profil & Dos/Don'ts ansehen</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

        </div>

        {/* 3 Pillar Micro Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-stone-100 text-xs">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50/60">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-stone-800 block">Screen-Free Rate: {metrics.screenFreeRatio}%</span>
              <span className="text-stone-500 text-[11px]">Achtsam ohne Ablenkung</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50/60">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-stone-800 block">Stabiles Energie-Level</span>
              <span className="text-stone-500 text-[11px]">Kein schweres Food-Koma</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50/60">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-800">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-stone-800 block">{moments.length + checkIns.length} Datenpunkte</span>
              <span className="text-stone-500 text-[11px]">Kontinuierlicher Lerneffekt</span>
            </div>
          </div>
        </div>
      </section>

      {/* Grid: Daily Focus & Habit Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Card 1: Today's Coaching Focus */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-600 flex items-center gap-1.5">
                <Brain className="w-4 h-4" />
                <span>Heutiger Coaching-Impuls</span>
              </span>
              <span className="text-[11px] font-medium text-stone-400">Tag 5 von 14</span>
            </div>

            <h3 className="font-display font-bold text-lg text-stone-900">
              {metrics.dailyFocusTitle}
            </h3>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/60">
              💡 <strong className="text-stone-900">Coach-Praxistipp:</strong> {metrics.dailyFocusTip}
            </p>

            <div className="space-y-2 text-xs text-stone-600">
              <span className="font-semibold text-stone-800 block">Die 3 goldenen Achtsamkeits-Regeln:</span>
              <ul className="space-y-1.5 list-disc pl-4 text-stone-600">
                <li><strong className="text-stone-800">Vor dem Bissen:</strong> Hunger spüren (1-5 Skala).</li>
                <li><strong className="text-stone-800">Beim Essen:</strong> 20-30x kauen, Texturen und Aromen wahrnehmen.</li>
                <li><strong className="text-stone-800">Am Ende:</strong> Bei Stufe 4 aufhören, bevor Völlegefühl eintritt.</li>
              </ul>
            </div>
          </div>

          <button
            onClick={onOpenAddModal}
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>Nächste Mahlzeit achtsam erfassen</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </section>

        {/* Card 2: Interactive Coaching Goals (Habits) */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <span className="text-xs font-semibold text-amber-600 block">Tägliche Gewohnheiten</span>
              <h3 className="font-display font-bold text-base sm:text-lg text-stone-900">
                Coaching-Ziele für heute
              </h3>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
              {goals.filter((g) => g.completed).length} / {goals.length} Erreicht
            </span>
          </div>

          <div className="space-y-2.5">
            {goals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  goal.completed
                    ? 'bg-emerald-50/50 border-emerald-200/70 text-stone-900'
                    : 'bg-stone-50 border-stone-200/80 hover:bg-stone-100/80 text-stone-800'
                }`}
              >
                <button
                  type="button"
                  aria-label="Ziel abhaken"
                  className={`mt-0.5 p-1 rounded-lg transition-colors ${
                    goal.completed
                      ? 'bg-emerald-500 text-white'
                      : 'border border-stone-300 text-transparent hover:border-amber-500'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-semibold ${goal.completed ? 'line-through text-stone-500' : 'text-stone-900'}`}>
                      {goal.title}
                    </span>
                    <span className="text-[11px] font-medium text-stone-500 shrink-0">
                      {goal.current}/{goal.target} {goal.unit}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                    {goal.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-stone-400 text-center italic">
            Tippe auf ein Ziel, um deinen täglichen Fortschritt festzuhalten.
          </p>
        </section>

      </div>

      {/* Interactive Coach Chat Section ("Frag Cary") */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs space-y-4">
        
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-stone-900">
                  Frag Cary
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online & Fürsorglich" />
              </div>
              <p className="text-[11px] text-stone-500">
                Erhalte persönliches, warmherziges Feedback zu deinen Mahlzeiten & Ernährungsfragen
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-block text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
            Fürsorge-KI
          </span>
        </div>

        {/* Chat History Box */}
        <div className="bg-stone-50 rounded-2xl p-4 max-h-80 overflow-y-auto space-y-3.5 border border-stone-200/60 no-scrollbar">
          {chatMessages.map((msg) => {
            const isCoach = msg.sender === 'coach';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isCoach ? 'items-start' : 'items-end'} space-y-1.5`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    isCoach
                      ? 'bg-white border border-stone-200/80 text-stone-800 shadow-2xs'
                      : 'bg-amber-500 text-white shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                <span className="text-[10px] text-stone-400 px-1">
                  {msg.timestamp}
                </span>

                {/* Suggestions Pills if provided */}
                {isCoach && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 max-w-full">
                    {msg.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSendMessage(sug)}
                        className="text-left px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 border border-stone-200 hover:border-amber-300 text-stone-700 text-xs font-medium transition-colors shadow-2xs"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-1.5 text-xs text-stone-500 p-2 bg-white rounded-2xl border border-stone-200/80 w-fit">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px]">Cary überlegt fürsorglich...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Frage stellen, z.B. 'Wie vermeide ich Heißhunger?' oder 'Analysiere mein Mittagessen'..."
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 text-stone-900 rounded-xl focus:border-amber-500 focus:bg-white focus:outline-hidden"
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Senden</span>
          </button>
        </div>

      </section>

      {/* Recent Logged Moments Coach Evaluation */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <span className="text-xs font-semibold text-amber-600 block">Mahlzeiten-Feedback</span>
            <h3 className="font-display font-bold text-base sm:text-lg text-stone-900">
              Letzte Coaching-Bewertungen
            </h3>
          </div>
          <button
            onClick={onNavigateToTimeline}
            className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <span>Alle anzeigen</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {moments.slice(0, 4).map((moment) => {
            const feedback = moment.coachFeedback;
            return (
              <div
                key={moment.id}
                onClick={() => onSelectMoment(moment)}
                className="p-3.5 rounded-2xl bg-stone-50 hover:bg-amber-50/30 border border-stone-200/80 hover:border-amber-300 transition-all cursor-pointer flex gap-3 group"
              >
                <img
                  src={moment.imageUrl}
                  alt={moment.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-200"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-700">
                      {moment.label}
                    </span>
                    {feedback?.badge && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                        {feedback.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-xs sm:text-sm text-stone-900 truncate group-hover:text-amber-600 transition-colors">
                    {moment.title}
                  </h4>
                  {feedback ? (
                    <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                      💬 {feedback.message}
                    </p>
                  ) : (
                    <p className="text-[11px] text-stone-500">
                      Hunger {moment.hungerLevel || 3}/5 • Sättigung {moment.fullnessLevel || 4}/5
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
