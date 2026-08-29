import React from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  Sparkles, 
  Moon, 
  Sun, 
  Utensils, 
  Smile, 
  ArrowRight, 
  Check, 
  FastForward,
  HeartPulse,
  BatteryCharging,
  Volume2,
  Heart
} from 'lucide-react';
import { DailyCheckIn, TimeOfDayPhase, FoodMood, EatingPace, DistractionLevel } from '../types';
import { getCurrentCaringPrompt, CaringPrompt } from '../utils/caringPrompts';
import { MealVisualPicker } from './MealVisualPicker';

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCheckIn: (checkIn: Omit<DailyCheckIn, 'id' | 'createdAt'>) => void;
  existingCheckInsCount?: number;
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  isOpen,
  onClose,
  onSaveCheckIn,
  existingCheckInsCount = 0,
}) => {
  // Caring prompt for time-appropriate empathy
  const caringPrompt: CaringPrompt = React.useMemo(() => getCurrentCaringPrompt(), []);

  // Determine current phase based on local hour
  const currentHour = new Date().getHours();
  const timePhase: TimeOfDayPhase = 
    currentHour >= 5 && currentHour < 11 
      ? 'morning' 
      : currentHour >= 11 && currentHour < 16 
        ? 'midday' 
        : 'evening';

  // Mode: full survey vs. skipped quick prompt ("Wie geht es dir?")
  const [isQuickMode, setIsQuickMode] = React.useState(false);
  const [step, setStep] = React.useState<number>(1);

  // Sleep fields (Morning)
  const [sleepHours, setSleepHours] = React.useState<number>(7.5);
  const [sleepQuality, setSleepQuality] = React.useState<number>(4);
  const [wakeFeeling, setWakeFeeling] = React.useState<'refreshed' | 'normal' | 'tired' | 'exhausted'>('refreshed');

  // Food fields
  const [mealTitle, setMealTitle] = React.useState<string>('');
  const [hungerBefore, setHungerBefore] = React.useState<number>(3);
  const [fullnessAfter, setFullnessAfter] = React.useState<number>(4);
  const [eatingPace, setEatingPace] = React.useState<EatingPace>('slow');
  const [distraction, setDistraction] = React.useState<DistractionLevel>('mindful');

  // Wellbeing fields
  const [energyLevel, setEnergyLevel] = React.useState<number>(4);
  const [mood, setMood] = React.useState<FoodMood>('energized');
  const [stressLevel, setStressLevel] = React.useState<number>(2);
  const [waterGlasses, setWaterGlasses] = React.useState<number>(4);
  const [noteText, setNoteText] = React.useState<string>('');
  const [voiceTranscription, setVoiceTranscription] = React.useState<string>('');

  // Voice recording state
  const [isRecording, setIsRecording] = React.useState<boolean>(false);
  const [audioLevel, setAudioLevel] = React.useState<number>(0);
  const recognitionRef = React.useRef<any>(null);

  // Initialize Speech Recognition
  React.useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'de-DE';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript.trim()) {
          setVoiceTranscription(currentTranscript);
          setNoteText(currentTranscript);
        }
      };

      recognition.onerror = (err: any) => {
        console.log('Speech recognition notice:', err);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Voice recording wave animation interval
  React.useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setAudioLevel(Math.floor(Math.random() * 80) + 20);
      }, 120);
    } else {
      setAudioLevel(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleVoiceRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      setIsRecording(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // ignore if already started
        }
      } else {
        // Fallback simulation if speech recognition is not supported in iframe/browser
        setTimeout(() => {
          if (!noteText) {
            const fallbackText = isQuickMode 
              ? 'Mir geht es heute gut, habe gut geschlafen und fühle mich fit!' 
              : 'Schlaf war erholsam, Frühstück war gesund und ich habe viel Energie für den Tag.';
            setVoiceTranscription(fallbackText);
            setNoteText(fallbackText);
          }
        }, 2200);
      }
    }
  };

  if (!isOpen) return null;

  const totalSteps = timePhase === 'morning' ? 3 : 2;

  const handleFinishCheckIn = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let coachSummary = 'Dein Check-in wurde erfolgreich analysiert. Hervorragender Fokus auf dein Wohlbefinden!';
    if (timePhase === 'morning') {
      coachSummary = `Guten Morgen! Mit ${sleepHours}h Schlaf und Energielevel ${energyLevel}/5 hast du eine starke Basis für den Tag gelegt.`;
    } else if (timePhase === 'midday') {
      coachSummary = `Mittags-Check erfasst! Achte am Nachmittag auf ausreichend Wasser (${waterGlasses} Gläser bisher).`;
    } else {
      coachSummary = `Tagesabschluss analysiert. Dein Körper bereitet sich optimal auf die nächtliche Regeneration vor.`;
    }

    onSaveCheckIn({
      date: todayStr,
      time: timeStr,
      timeOfDay: timePhase,
      sleep: timePhase === 'morning' ? {
        durationHours: sleepHours,
        quality: sleepQuality,
        wakeFeeling,
      } : undefined,
      food: mealTitle ? {
        mealTitle,
        category: timePhase === 'morning' ? 'breakfast' : timePhase === 'midday' ? 'lunch' : 'dinner',
        hungerBefore,
        fullnessAfter,
        eatingPace,
        distraction,
      } : undefined,
      wellbeing: {
        energyLevel,
        mood,
        stressLevel,
        waterGlasses,
        note: noteText || voiceTranscription,
        voiceTranscription,
      },
      coachSummary,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              {timePhase === 'morning' ? (
                <Sun className="w-5 h-5 text-amber-100" />
              ) : timePhase === 'midday' ? (
                <Utensils className="w-5 h-5 text-amber-100" />
              ) : (
                <Moon className="w-5 h-5 text-amber-100" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  {caringPrompt.emoji} {timePhase === 'morning' ? 'Morgen-Check' : timePhase === 'midday' ? 'Mittags-Check' : 'Abend-Check'}
                </span>
                <span className="text-[10px] text-stone-600 bg-white px-2 py-0.5 rounded-full border border-stone-200">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-display font-bold text-stone-900 leading-tight">
                {isQuickMode ? caringPrompt.headline : timePhase === 'morning' ? 'Wie hast du geschlafen?' : timePhase === 'midday' ? 'Wie läuft dein Tag bisher?' : 'Wie war dein Tag heute?'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Schließen"
            className="p-2 rounded-xl text-stone-600 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Progress & Skip Toggle Bar */}
        <div className="px-5 py-2.5 bg-stone-100/60 border-b border-stone-100 flex items-center justify-between text-xs">
          {!isQuickMode ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-stone-700">Schritt {step} von {totalSteps}</span>
                <span className="text-stone-600">•</span>
                <span className="text-stone-700 font-medium">
                  {step === 1 ? (timePhase === 'morning' ? 'Schlaf & Erholung' : 'Essen & Sättigung') : step === 2 ? (timePhase === 'morning' ? 'Frühstück & Essen' : 'Wohlbefinden & Energie') : 'Wohlbefinden'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsQuickMode(true)}
                className="text-stone-700 hover:text-amber-800 font-semibold flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-white border border-transparent hover:border-stone-200"
              >
                <span>Befragung überspringen</span>
                <FastForward className="w-3.5 h-3.5 text-amber-800" />
              </button>
            </>
          ) : (
            <>
              <span className="text-emerald-900 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-800" />
                Schnell-Check-in via Sprache oder Text
              </span>
              <button
                type="button"
                onClick={() => setIsQuickMode(false)}
                className="text-stone-700 hover:text-stone-900 font-semibold underline text-[11px]"
              >
                Zur vollen Befragung
              </button>
            </>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 no-scrollbar flex-1">
          
          {/* QUICK MODE: "Sag's mir!" with prominent Green WhatsApp Mic Button */}
          {isQuickMode ? (
            <div className="space-y-5 text-center py-2">
              <div className="max-w-sm mx-auto space-y-2">
                <span className="text-3xl">{caringPrompt.emoji}</span>
                <h3 className="text-lg sm:text-xl font-display font-bold text-stone-900">
                  {caringPrompt.headline}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-medium">
                  {caringPrompt.subtext}
                </p>

                {/* Caring Coach Thought Bubble */}
                <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/60 text-left text-xs space-y-1">
                  <p className="text-stone-700 italic">
                    💬 {caringPrompt.bubbleText}
                  </p>
                  <p className="text-[11px] text-amber-900 font-semibold">
                    💡 {caringPrompt.careTip}
                  </p>
                </div>
              </div>

              {/* Green WhatsApp-Style Mic Action Button with "Sag's mir!" */}
              <div className="flex flex-col items-center justify-center py-3 space-y-3">
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  aria-label={isRecording ? 'Aufnahme stoppen' : "Sag's mir - Sprachaufnahme starten"}
                  className={`px-8 py-4 sm:py-5 rounded-3xl flex items-center gap-3.5 shadow-lg transition-all relative font-bold ${
                    isRecording
                      ? 'bg-red-500 text-white scale-105 ring-8 ring-rose-500/20 animate-pulse'
                      : 'bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white ring-4 ring-emerald-500/20 shadow-emerald-500/30'
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="w-7 h-7" />
                  ) : (
                    <Mic className="w-7 h-7 stroke-[2.5]" />
                  )}

                  <div className="text-left">
                    <span className="text-base sm:text-lg font-display font-bold block leading-none">
                      {isRecording ? 'Ich höre zu...' : "Sag's mir!"}
                    </span>
                    <span className="text-xs text-emerald-100 font-normal block mt-1">
                      {isRecording ? 'Tippen zum Stoppen' : 'Sprich frei von der Leber weg'}
                    </span>
                  </div>

                  {/* Pulsing ring indicator */}
                  {isRecording && (
                    <span className="w-3 h-3 rounded-full bg-white animate-ping ml-1" />
                  )}
                </button>

                <div className="text-center">
                  <span className="text-xs font-bold text-stone-800 block">
                    {isRecording ? '🔴 Nimmt auf... Sprich jetzt mit Cary' : 'WhatsApp Voice Check-in'}
                  </span>
                  <span className="text-[11px] text-stone-600">
                    Automatische Transkription & Fürsorge-Anpassung von Cary
                  </span>
                </div>

                {/* Live audio waves indicator when active */}
                {isRecording && (
                  <div className="flex items-center gap-1 h-6">
                    {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
                      <span
                        key={bar}
                        className="w-1 bg-[#25D366] rounded-full transition-all duration-75"
                        style={{ height: `${Math.max(4, Math.random() * 24)}px` }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Text Input / Live Transcript Box */}
              <div className="text-left space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Dein Eintrag (Sprache oder Text):
                </label>
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="z.B. 'Habe super geschlafen, fühle mich energiegeladen, mittags gab es einen leichten Salat...'"
                  className="w-full p-3.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 text-stone-900 rounded-2xl focus:border-emerald-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Quick Mood Selector */}
              <div className="text-left space-y-2">
                <label className="text-xs font-bold text-stone-700 block">
                  Schnell-Stimmung:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { key: 'energized', emoji: '⚡', label: 'Energisch' },
                    { key: 'satisfied', emoji: '😌', label: 'Zufrieden' },
                    { key: 'light', emoji: '🍃', label: 'Leicht' },
                    { key: 'joyful', emoji: '✨', label: 'Freudig' },
                    { key: 'comfort', emoji: '☕', label: 'Gemütlich' },
                    { key: 'indulgent', emoji: '🍰', label: 'Gönnend' },
                  ].map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setMood(m.key as FoodMood)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        mood === m.key
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <span className="text-base block">{m.emoji}</span>
                      <span className="text-[10px] mt-0.5 block truncate">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* MULTI-STEP TIME-AWARE QUESTIONNAIRE */
            <>
              {/* STEP 1 (Morning = Sleep, Midday/Evening = Food) */}
              {step === 1 && (
                <div className="space-y-4">
                  {timePhase === 'morning' ? (
                    <>
                      <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                            <Moon className="w-4 h-4 text-amber-800" />
                            <span>1. Schlafdauer & Erholung</span>
                          </span>
                          <span className="text-sm font-bold text-amber-900">{sleepHours} Stunden</span>
                        </div>

                        <input
                          type="range"
                          min="4"
                          max="11"
                          step="0.5"
                          value={sleepHours}
                          onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                          className="w-full accent-amber-800 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-stone-600 font-medium">
                          <span>4h</span>
                          <span>7-8h (Ideal)</span>
                          <span>11h</span>
                        </div>
                      </div>

                      {/* Sleep Quality */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700 block">
                          Schlafqualität (1 = Schlecht, 5 = Tief & Erholsam):
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setSleepQuality(num)}
                              className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                                sleepQuality === num
                                  ? 'bg-amber-500 text-white border-amber-500'
                                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                              }`}
                            >
                              {num} ⭐
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Wake feeling */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700 block">
                          Aufwach-Gefühl:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          {[
                            { key: 'refreshed', label: 'Frisch & fit', emoji: '☀️' },
                            { key: 'normal', label: 'Ausgeglichen', emoji: '🙂' },
                            { key: 'tired', label: 'Noch müde', emoji: '🥱' },
                            { key: 'exhausted', label: 'Erschöpft', emoji: '😴' },
                          ].map((f) => (
                            <button
                              key={f.key}
                              type="button"
                              onClick={() => setWakeFeeling(f.key as any)}
                              className={`p-2.5 rounded-xl border text-left transition-all ${
                                wakeFeeling === f.key
                                  ? 'bg-amber-50 border-amber-800 text-amber-900 font-bold'
                                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                              }`}
                            >
                              <span className="block text-base">{f.emoji}</span>
                              <span className="text-[11px] font-semibold block mt-0.5">{f.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Midday / Evening Step 1: Essen */
                    <>
                      <MealVisualPicker
                        value={mealTitle}
                        onChange={setMealTitle}
                        timePhase={timePhase}
                      />

                      {/* Sättigung & Hunger */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                          <div className="flex justify-between text-stone-600 mb-1">
                            <span>Hunger davor:</span>
                            <span className="font-bold text-amber-800">{hungerBefore}/5</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={hungerBefore}
                            onChange={(e) => setHungerBefore(parseInt(e.target.value, 10))}
                            className="w-full accent-amber-800"
                          />
                        </div>

                        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                          <div className="flex justify-between text-stone-600 mb-1">
                            <span>Sättigung danach:</span>
                            <span className="font-bold text-emerald-800">{fullnessAfter}/5</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={fullnessAfter}
                            onChange={(e) => setFullnessAfter(parseInt(e.target.value, 10))}
                            className="w-full accent-emerald-800"
                          />
                        </div>
                      </div>

                      {/* Mindful & Screen */}
                      <div className="grid grid-cols-2 gap-2.5 text-xs">
                        <div>
                          <label className="text-[11px] font-bold text-stone-600 block mb-1">⏱️ Tempo</label>
                          <select
                            value={eatingPace}
                            onChange={(e) => setEatingPace(e.target.value as any)}
                            className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                          >
                            <option value="slow">In Ruhe genossen</option>
                            <option value="moderate">Normal</option>
                            <option value="rushed">Gehetzt</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-stone-600 block mb-1">🧘 Ablenkung</label>
                          <select
                            value={distraction}
                            onChange={(e) => setDistraction(e.target.value as any)}
                            className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                          >
                            <option value="mindful">Ohne Screen / Achtsam</option>
                            <option value="screen">Mit Smartphone / TV</option>
                            <option value="social">In Gesellschaft</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* STEP 2 (Morning: Breakfast plans, Midday/Evening: Wellbeing & Voice) */}
              {step === 2 && (
                <div className="space-y-4">
                  {timePhase === 'morning' ? (
                    <>
                      <MealVisualPicker
                        value={mealTitle}
                        onChange={setMealTitle}
                        timePhase={timePhase}
                      />

                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs">
                        <div className="flex justify-between text-stone-600 mb-1">
                          <span>Morgen-Hunger:</span>
                          <span className="font-bold text-amber-800">{hungerBefore}/5</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={hungerBefore}
                          onChange={(e) => setHungerBefore(parseInt(e.target.value, 10))}
                          className="w-full accent-amber-800"
                        />
                      </div>
                    </>
                  ) : null}

                  {/* Wellbeing & Energy */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-stone-800 flex items-center gap-1.5">
                        <BatteryCharging className="w-4 h-4 text-emerald-800" />
                        Energielevel:
                      </span>
                      <span className="font-bold text-emerald-800 text-sm">{energyLevel}/5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={energyLevel}
                      onChange={(e) => setEnergyLevel(parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-800"
                    />
                  </div>

                  {/* WhatsApp Mic in Questionnaire */}
                  <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/70 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">
                        Schnelle Sprachnotiz hinzufügen?
                      </span>
                      <span className="text-[11px] text-stone-600">
                        {isRecording ? '🔴 Nimmt auf...' : 'Tippe auf das grüne Mic zum Diktieren'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={toggleVoiceRecording}
                      aria-label="Sprachaufnahme umschalten"
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-xs transition-all ${
                        isRecording ? 'bg-red-500 animate-pulse' : 'bg-[#25D366] hover:bg-[#20bd5a]'
                      }`}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  </div>

                  {noteText && (
                    <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-700 italic">
                      "{noteText}"
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3 (Only for Morning) */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-stone-800 flex items-center gap-1.5">
                        <BatteryCharging className="w-4 h-4 text-emerald-800" />
                        Morgen-Energie:
                      </span>
                      <span className="font-bold text-emerald-800 text-sm">{energyLevel}/5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={energyLevel}
                      onChange={(e) => setEnergyLevel(parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-800"
                    />
                  </div>

                  {/* WhatsApp Mic button in Step 3 */}
                  <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/70 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">
                        Gedanken oder Tages-Intention aufnehmen
                      </span>
                      <span className="text-[11px] text-stone-600">
                        {isRecording ? '🔴 Nimmt auf...' : 'WhatsApp Voice Record Button'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={toggleVoiceRecording}
                      aria-label="Sprachaufnahme umschalten"
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-xs transition-all ${
                        isRecording ? 'bg-red-500 animate-pulse' : 'bg-[#25D366] hover:bg-[#20bd5a]'
                      }`}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  </div>

                  {noteText && (
                    <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-700 italic">
                      "{noteText}"
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-100 bg-stone-50/70 flex items-center justify-between gap-3">
          {isQuickMode ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-800"
              >
                Später
              </button>

              <button
                type="button"
                onClick={handleFinishCheckIn}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Check-in speichern</span>
              </button>
            </>
          ) : (
            <>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-800"
                >
                  Zurück
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsQuickMode(true)}
                  className="px-3.5 py-2 text-xs font-medium text-stone-500 hover:text-stone-700"
                >
                  Überspringen
                </button>
              )}

              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <span>Weiter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinishCheckIn}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Check-in abschließen</span>
                </button>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};
