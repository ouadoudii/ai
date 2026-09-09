import React from 'react';
import { ArrowLeft, LoaderCircle, Mic2, Square, X } from 'lucide-react';
import { transcribeAudio } from '../utils/localAi';
import { useLanguage } from '../i18n';

interface Props{
  isOpen:boolean;
  onClose:()=>void;
  onBack:()=>void;
  onTranscript:(text:string)=>void;
}

export const VoiceCaptureModal:React.FC<Props>=({isOpen,onClose,onBack,onTranscript})=>{
  const {language}=useLanguage();
  const ar=language==='ar';
  const [recording,setRecording]=React.useState(false);
  const [processing,setProcessing]=React.useState(false);
  const [error,setError]=React.useState('');
  const [seconds,setSeconds]=React.useState(0);
  const recorderRef=React.useRef<MediaRecorder|null>(null);
  const streamRef=React.useRef<MediaStream|null>(null);
  const chunksRef=React.useRef<Blob[]>([]);
  const cancelRef=React.useRef(false);
  const speechRef=React.useRef<any>(null);
  const speechTextRef=React.useRef('');
  const speechDoneRef=React.useRef<Promise<void>|null>(null);
  const speechDoneResolveRef=React.useRef<(()=>void)|null>(null);

  const cleanup=React.useCallback(()=>{
    streamRef.current?.getTracks().forEach(track=>track.stop());
    streamRef.current=null;
    recorderRef.current=null;
    try{speechRef.current?.stop?.()}catch{}
    speechRef.current=null;
  },[]);

  React.useEffect(()=>()=>cleanup(),[cleanup]);
  React.useEffect(()=>{
    if(!recording){setSeconds(0);return}
    const timer=window.setInterval(()=>setSeconds(s=>s+1),1000);
    return()=>window.clearInterval(timer);
  },[recording]);

  if(!isOpen)return null;

  const start=async()=>{
    setError('');
    cancelRef.current=false;
    speechTextRef.current='';
    speechDoneRef.current=null;
    speechDoneResolveRef.current=null;

    const SpeechRecognitionCtor=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
    if(SpeechRecognitionCtor){
      try{
        const recognition=new SpeechRecognitionCtor();
        recognition.lang=ar?'ar-MA':'en-US';
        recognition.interimResults=true;
        recognition.continuous=true;
        recognition.onresult=(event:any)=>{
          let text='';
          for(let i=0;i<event.results.length;i++)text+=String(event.results[i][0]?.transcript||'')+' ';
          speechTextRef.current=text.trim();
        };
        speechDoneRef.current=new Promise<void>(resolve=>{speechDoneResolveRef.current=resolve});
        recognition.onend=()=>{
          speechDoneResolveRef.current?.();
          speechDoneResolveRef.current=null;
          if(cancelRef.current)return;
          const text=speechTextRef.current.trim();
          setRecording(false);
          if(text)onTranscript(text);
          else setError(ar?'لم نفهم الكلام. جرّب مرة أخرى وتكلم بوضوح.':'We could not understand that. Try again and speak clearly.');
        };
        recognition.onerror=(event:any)=>{
          speechDoneResolveRef.current?.();
          speechDoneResolveRef.current=null;
          setRecording(false);
          if(cancelRef.current)return;
          const code=String(event?.error||'');
          if(code==='not-allowed'||code==='service-not-allowed')setError(ar?'نحتاج إذن الميكروفون للتسجيل.':'Microphone permission is needed to record.');
          else setError(ar?'تعذر التعرف على الكلام. جرّب مرة أخرى.':'Speech recognition failed. Try again.');
        };
        recognition.start();
        speechRef.current=recognition;
        setRecording(true);
        return;
      }catch{}
    }

    if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined'){
      setError(ar?'التسجيل الصوتي غير مدعوم في هذا المتصفح.':'Voice recording is not supported in this browser.');
      return;
    }
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      streamRef.current=stream;
      chunksRef.current=[];
      const recorder=new MediaRecorder(stream);
      recorderRef.current=recorder;
      recorder.ondataavailable=e=>{if(e.data.size)chunksRef.current.push(e.data)};
      recorder.onstop=async()=>{
        const blob=new Blob(chunksRef.current,{type:recorder.mimeType||'audio/webm'});
        const cancelled=cancelRef.current;
        cleanup();
        setRecording(false);
        if(cancelled||!blob.size)return;
        setProcessing(true);
        try{
          const text=await transcribeAudio(blob,language);
          if(!text)throw new Error('empty transcript');
          onTranscript(text);
        }catch{
          setError(ar?'لم نستطع فهم التسجيل. جرّب مرة أخرى أو اكتبها يدوياً.':'We could not understand the recording. Try again or type it manually.');
        }finally{setProcessing(false)}
      };
      recorder.start(250);
      setRecording(true);
    }catch{
      cleanup();
      setError(ar?'نحتاج إذن الميكروفون للتسجيل.':'Microphone permission is needed to record.');
    }
  };
  const stop=()=>{
    if(speechRef.current){
      try{speechRef.current.stop()}catch{}
      return;
    }
    if(recorderRef.current?.state==='recording')recorderRef.current.stop();
  };

  const leave=(fn:()=>void)=>{cancelRef.current=true;if(recorderRef.current?.state==='recording')recorderRef.current.stop();else cleanup();setRecording(false);fn()};
  const back=()=>leave(onBack);

  return <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-[#25231F]/55 backdrop-blur-md" role="dialog" aria-modal="true">
    <section className="w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] bg-[#FCFAF6] p-5 sm:p-6 shadow-2xl">
      <div className="flex items-center justify-between">
        <button type="button" onClick={back} className="w-10 h-10 rounded-full bg-white border border-[#E6E1D8] flex items-center justify-center" aria-label={ar?'رجوع':'Back'}><ArrowLeft className={`w-4 h-4 ${ar?'rotate-180':''}`}/></button>
        <button type="button" onClick={()=>leave(onClose)} className="w-10 h-10 rounded-full bg-white border border-[#E6E1D8] flex items-center justify-center" aria-label={ar?'إغلاق':'Close'}><X className="w-4 h-4"/></button>
      </div>
      <div className="mt-5 text-center">
        <h2 className="text-2xl font-display font-black text-[#252824]">{ar?'قل ماذا أكلت':'Tell me what you had'}</h2>
        <p className="mt-2 text-sm text-[#77736B]">{ar?'تحدث بطريقتك — العربية أو الدارجة أو الإنجليزية.':'Speak naturally — Arabic, Darija or English.'}</p>
      </div>
      <div className="mt-7 flex flex-col items-center">
        <button type="button" disabled={processing} onClick={recording?stop:start} className={`w-24 h-24 rounded-full grid place-items-center text-white shadow-xl transition ${recording?'bg-[#C94C3F]':'bg-[#293D34]'} disabled:opacity-60`} aria-label={recording?(ar?'إيقاف التسجيل':'Stop recording'):(ar?'ابدأ التسجيل':'Start recording')}>
          {processing?<LoaderCircle className="w-8 h-8 animate-spin"/>:recording?<Square className="w-8 h-8 fill-current"/>:<Mic2 className="w-9 h-9"/>}
        </button>
        <p className="mt-4 text-sm font-black text-[#4A4C46]">{processing?(ar?'نفهم التسجيل على جهازك…':'Understanding it on your device…'):recording?String(seconds)+'s':(ar?'اضغط وابدأ الكلام':'Tap and start speaking')}</p>
        {processing&&<p className="mt-2 text-[11px] text-[#8A867E]">{ar?'أول مرة قد تحتاج وقتاً لتحميل نموذج Whisper المجاني.':'The first use may take a moment while the free Whisper model downloads.'}</p>}
        {error&&<p className="mt-4 rounded-2xl bg-[#FCE9E5] px-4 py-3 text-xs font-bold text-[#9B453A]">{error}</p>}
      </div>
    </section>
  </div>;
};
