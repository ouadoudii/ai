import React from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Heart, 
  Smile, 
  Sun, 
  Moon, 
  Coffee, 
  Utensils, 
  CheckCircle2, 
  Volume2,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Send,
  Loader2
} from 'lucide-react';
import { getCurrentCaringPrompt, CaringPrompt } from '../utils/caringPrompts';
import { FoodMoment, DailyCheckIn, NutritionArchetype } from '../types';
import { processVoiceCheckIn } from '../apiClient';

interface CaringVoiceHeroProps {
  onOpenFullCheckIn: () => void;
  onQuickVoiceSubmit: (text: string, aiFeedback?: any) => void;
  recentMoments: FoodMoment[];
  latestCheckIn?: DailyCheckIn;
  archetype?: NutritionArchetype;
}

export const CaringVoiceHero: React.FC<CaringVoiceHeroProps> = ({
  onOpenFullCheckIn,
  onQuickVoiceSubmit,
  recentMoments,
  latestCheckIn,
  archetype = 'intuitive_mindful',
}) => {
  const [caringPrompt, setCaringPrompt] = React.useState<CaringPrompt>(getCurrentCaringPrompt());
  const [isRecording, setIsRecording] = React.useState<boolean>(false);
  const [transcript, setTranscript] = React.useState<string>('');
  const [isProcessingAI, setIsProcessingAI] = React.useState<boolean>(false);
  const [aiCoachFeedback, setAiCoachFeedback] = React.useState<any | null>(null);
  const [feedbackSent, setFeedbackSent] = React.useState<boolean>(false);
  const recognitionRef = React.useRef<any>(null);

  // Update prompt periodically or on mount
  React.useEffect(() => {
    setCaringPrompt(getCurrentCaringPrompt());
  }, []);

  // Web Speech Recognition
  React.useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'de-DE';

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        if (currentText.trim()) {
          setTranscript(currentText);
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

  const handleToggleMic = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      setFeedbackSent(false);
      setAiCoachFeedback(null);
      setIsRecording(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // ignore
        }
      } else {
        // Fallback simulation if browser/iframe blocks mic
        setTimeout(() => {
          if (!transcript) {
            setTranscript(caringPrompt.audioExample);
          }
        }, 1800);
      }
    }
  };

  const handleSendTranscript = async () => {
    const text = transcript.trim();
    if (!text || isProcessingAI) return;

    setIsProcessingAI(true);
    try {
      const result = await processVoiceCheckIn(text, caringPrompt.timeSlot, archetype);
      setAiCoachFeedback(result.coachFeedback);
      onQuickVoiceSubmit(text, result);
      setFeedbackSent(true);
    } catch (err) {
      console.error('Error submitting voice checkin:', err);
      onQuickVoiceSubmit(text);
      setFeedbackSent(true);
    } finally {
      setIsProcessingAI(false);
      setTimeout(() => {
        setTranscript('');
      }, 5000);
    }
  };

  const handleQuickQuestionClick = (question: string) => {
    setTranscript((prev) => (prev ? `${prev} ${question}` : question));
  };

  return (
    <section className="bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-amber-500/5 rounded-3xl p-5 sm:p-7 border border-amber-500/20 shadow-xs relative overflow-hidden">
      
      {/* Background soft ambient badge */}
      <div className="absolute top-4 right-4 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-xs border border-amber-200/80 text-[11px] font-semibold text-amber-900 shadow-xs">
        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        <span>Cary sorgt für dich</span>
      </div>

      <div className="max-w-2xl space-y-4">
        
        {/* Dynamic Caring Headline */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs">
            <span>{caringPrompt.emoji}</span>
            <span>{caringPrompt.timeSlot.toUpperCase()} CHECK-IN</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 leading-tight">
            {caringPrompt.headline}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-medium">
            {caringPrompt.subtext}
          </p>
        </div>

        {/* Caring Coach Bubble */}
        <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-800 flex items-center justify-center shrink-0 font-bold mt-0.5">
              💬
            </div>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-semibold text-stone-800 italic">
                {caringPrompt.bubbleText}
              </p>
              <p className="text-[11px] text-emerald-800 font-medium">
                💡 <span className="font-bold">Coach-Gedanke:</span> {caringPrompt.careTip}
              </p>
            </div>
          </div>

          {/* Quick inspiration chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {caringPrompt.quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestionClick(q)}
                className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-stone-100/90 hover:bg-amber-100 hover:text-amber-900 text-stone-700 transition-colors border border-stone-200/60"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Voice Action Section */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-3">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            
            {/* BIG Green WhatsApp Microphone Button with "Sag's mir!" */}
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleToggleMic}
                aria-label={isRecording ? 'Aufnahme beenden' : "Sag's mir - Sprachaufnahme starten"}
                className={`w-full sm:w-auto px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl flex items-center justify-center sm:justify-start gap-3 text-white shadow-md transition-all shrink-0 font-bold ${
                  isRecording
                    ? 'bg-rose-500 ring-4 ring-rose-500/20 animate-pulse'
                    : 'bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 ring-4 ring-emerald-500/20 shadow-emerald-500/30'
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6 stroke-[2.5]" />
                )}
                
                <div className="text-left">
                  <span className="text-sm sm:text-base font-display font-bold block leading-none">
                    {isRecording ? 'Ich höre zu...' : "Sag's mir!"}
                  </span>
                  <span className="text-[10px] text-emerald-100 font-normal block mt-1">
                    {isRecording ? 'Tippen zum Beenden' : 'Tippen zum Sprechen'}
                  </span>
                </div>

                {isRecording && (
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping ml-1" />
                )}
              </button>

              <div className="space-y-0.5 hidden sm:block">
                <span className="text-xs font-bold text-stone-900 block">
                  {isRecording ? '🔴 Cary hört dir aufmerksam zu...' : 'WhatsApp Voice Check-in'}
                </span>
                <span className="text-[11px] text-stone-500">
                  {isRecording ? 'Sprich frei heraus.' : 'Schnell, unkompliziert & herzlich.'}
                </span>
              </div>
            </div>

            {/* Switch to detailed questionnaire button */}
            <button
              onClick={onOpenFullCheckIn}
              className="text-xs font-semibold text-stone-600 hover:text-amber-800 px-3 py-2 rounded-xl hover:bg-stone-100 transition-colors flex items-center justify-center gap-1 shrink-0 border border-stone-200/80 sm:border-transparent"
            >
              <span>Vollständige Befragung</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Voice Transcript / Text Field */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <div className="relative">
              <input
                type="text"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Oder hier kurz tippen: z.B. 'Gut geschlafen, trinke Kaffee & fühle mich fit...'"
                className="w-full pl-3.5 pr-24 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-hidden text-stone-900"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && transcript.trim()) {
                    handleSendTranscript();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleSendTranscript}
                disabled={!transcript.trim() || isProcessingAI}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
              >
                {isProcessingAI ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Cary denkt nach...</span>
                  </>
                ) : (
                  <>
                    <span>Senden</span>
                    <Send className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>

            {/* AI Coach Live Feedback */}
            {aiCoachFeedback && (
              <div className="p-3.5 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-2xl text-xs space-y-1.5 animate-in fade-in shadow-xs">
                <div className="flex items-center justify-between font-bold text-emerald-900">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>{aiCoachFeedback.title}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-white border border-emerald-300 text-emerald-800 font-semibold">
                    {aiCoachFeedback.badge}
                  </span>
                </div>
                <p className="text-emerald-900 leading-relaxed font-medium">
                  {aiCoachFeedback.message}
                </p>
              </div>
            )}

            {feedbackSent && !aiCoachFeedback && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Danke! Cary hat deine Nachricht erfasst und deinen Tag fürsorglich angepasst.</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
