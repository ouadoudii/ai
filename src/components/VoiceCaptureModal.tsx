import React from 'react';
import { ArrowLeft, LoaderCircle, Mic2, Square, X } from 'lucide-react';
import { useLanguage } from '../i18n';
import { mergeSpeechSegments } from '../utils/speechTranscript';
import { browserSpeechLocale, voiceCopy } from '../utils/speechLanguage';
import { transcribeVoiceRecording } from '../utils/voiceTranscription';

interface Props{isOpen:boolean;onClose:()=>void;onBack:()=>void;onTranscript:(text:string)=>void;mode?:'journal'|'profile';}

const FOCUSABLE_SELECTOR='button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function getVoiceFocusTrapDestination(shiftKey:boolean,inside:boolean,onFirst:boolean,onLast:boolean):'first'|'last'|null{
  if(!inside)return shiftKey?'last':'first';
  if(shiftKey&&onFirst)return'last';
  if(!shiftKey&&onLast)return'first';
  return null;
}

export const VoiceCaptureModal:React.FC<Props>=({isOpen,onClose,onBack,onTranscript,mode='journal'})=>{
  const {language}=useLanguage();const ar=language==='ar';const copy=voiceCopy(language);
  const profileCopy=language==='de'?{title:'Erzähl mir ein bisschen von dir',subtitle:'Was führt dich zu uns? Sprich frei — du kannst den Profil-Entwurf danach prüfen.'}:language==='fr'?{title:'Parle-moi un peu de toi',subtitle:"Qu’est-ce qui t’amène ici ? Parle librement — tu pourras vérifier le profil ensuite."}:language==='ar'?{title:'احكِ لي قليلاً عنك',subtitle:'ما الذي أتى بك إلينا؟ تكلم براحتك — ستراجع مسودة الملف قبل حفظها.'}:{title:'Tell me a little about you',subtitle:'What brings you here? Speak freely — you can review the profile draft afterwards.'};
  const titleCopy=mode==='profile'?profileCopy:{title:copy.title,subtitle:copy.subtitle};
  const [recording,setRecording]=React.useState(false);const [processing,setProcessing]=React.useState(false);const [error,setError]=React.useState('');const [seconds,setSeconds]=React.useState(0);const [diagnostic,setDiagnostic]=React.useState('');const [lastTranscript,setLastTranscript]=React.useState('');
  const recorderRef=React.useRef<MediaRecorder|null>(null);const streamRef=React.useRef<MediaStream|null>(null);const chunksRef=React.useRef<Blob[]>([]);const cancelRef=React.useRef(false);const speechRef=React.useRef<any>(null);const speechTextRef=React.useRef('');const speechDoneResolveRef=React.useRef<(()=>void)|null>(null);const finalSegmentsRef=React.useRef<Map<number,string>>(new Map());const captureRequestRef=React.useRef(0);const isOpenRef=React.useRef(isOpen);const dialogRef=React.useRef<HTMLDivElement|null>(null);const closeButtonRef=React.useRef<HTMLButtonElement|null>(null);const onCloseRef=React.useRef(onClose);const restoreFocusRef=React.useRef(true);
  const cleanup=React.useCallback(()=>{streamRef.current?.getTracks().forEach(track=>track.stop());streamRef.current=null;recorderRef.current=null;try{speechRef.current?.stop?.()}catch{}speechRef.current=null},[]);
  const leave=React.useCallback((fn:()=>void)=>{captureRequestRef.current++;cancelRef.current=true;if(recorderRef.current?.state==='recording')recorderRef.current.stop();else cleanup();setRecording(false);fn()},[cleanup]);
  React.useEffect(()=>{onCloseRef.current=onClose},[onClose]);
  React.useEffect(()=>()=>{captureRequestRef.current++;cancelRef.current=true;cleanup()},[cleanup]);React.useEffect(()=>{isOpenRef.current=isOpen;if(!isOpen){captureRequestRef.current++;cancelRef.current=true;cleanup();setRecording(false)}},[isOpen,cleanup]);React.useEffect(()=>{if(!recording){setSeconds(0);return}const timer=window.setInterval(()=>setSeconds(s=>s+1),1000);return()=>window.clearInterval(timer)},[recording]);
  React.useEffect(()=>{
    if(!isOpen||typeof document==='undefined')return;
    const dialog=dialogRef.current;
    const markedOpener=document.querySelector<HTMLElement>('[data-voice-return-focus="true"]');
    const activeOpener=document.activeElement instanceof HTMLElement?document.activeElement:null;
    const opener=markedOpener??activeOpener;
    const previousOverflow=document.body.style.overflow;
    const siblings:Element[]=dialog?.parentElement?Array.from(dialog.parentElement.children as HTMLCollectionOf<Element>).filter(element=>element!==dialog):[];
    const siblingState=siblings.map(element=>({element,hadInert:element.hasAttribute('inert'),ariaHidden:element.getAttribute('aria-hidden')}));
    restoreFocusRef.current=true;
    document.body.style.overflow='hidden';
    siblings.forEach(element=>{element.setAttribute('inert','');element.setAttribute('aria-hidden','true')});
    const frame=window.requestAnimationFrame(()=>closeButtonRef.current?.focus({preventScroll:true}));
    const handleKeyDown=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){
        event.preventDefault();event.stopPropagation();leave(onCloseRef.current);return;
      }
      if(event.key!=='Tab'||!dialog)return;
      const focusable=Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) as NodeListOf<HTMLElement>).filter(element=>element.offsetParent!==null);
      if(!focusable.length){event.preventDefault();dialog.focus({preventScroll:true});return}
      const first=focusable[0],last=focusable[focusable.length-1];
      const destination=getVoiceFocusTrapDestination(event.shiftKey,dialog.contains(document.activeElement),document.activeElement===first,document.activeElement===last);
      if(destination){event.preventDefault();(destination==='first'?first:last).focus({preventScroll:true})}
    };
    document.addEventListener('keydown',handleKeyDown,true);
    return()=>{
      window.cancelAnimationFrame(frame);document.removeEventListener('keydown',handleKeyDown,true);document.body.style.overflow=previousOverflow;
      siblingState.forEach(({element,hadInert,ariaHidden})=>{if(!hadInert)element.removeAttribute('inert');if(ariaHidden===null)element.removeAttribute('aria-hidden');else element.setAttribute('aria-hidden',ariaHidden)});
      markedOpener?.removeAttribute('data-voice-return-focus');
      if(restoreFocusRef.current&&opener?.isConnected)opener.focus({preventScroll:true});
    };
  },[isOpen,leave]);
  if(!isOpen)return null;
  const start=async()=>{const requestId=++captureRequestRef.current;setError('');setDiagnostic('');setLastTranscript('');cancelRef.current=false;speechTextRef.current='';speechDoneResolveRef.current=null;finalSegmentsRef.current.clear();
    const SpeechRecognitionCtor=(window as any).webkitSpeechRecognition||(window as any).SpeechRecognition;const preferLocalWhisper=ar;
    if(SpeechRecognitionCtor&&!preferLocalWhisper){setDiagnostic(language==='de'?'Pfad: Browser-Spracherkennung (de-DE)':'Path: browser speech recognition');try{const recognition=new SpeechRecognitionCtor();recognition.lang=browserSpeechLocale(language);recognition.interimResults=true;recognition.continuous=true;recognition.onresult=(event:any)=>{setDiagnostic(language==='de'?'Sprache vom Browser erkannt':'Browser speech result received');let interim='';const startIndex=Number.isFinite(event.resultIndex)?event.resultIndex:0;for(let i=startIndex;i<event.results.length;i++){const result=event.results[i];const segment=String(result?.[0]?.transcript||'').trim();if(!segment)continue;if(result?.isFinal===false)interim=segment;else finalSegmentsRef.current.set(i,segment)}const finals=[...finalSegmentsRef.current.entries()].sort((a,b)=>a[0]-b[0]).map(([,text])=>text);speechTextRef.current=mergeSpeechSegments([...finals,interim].filter(Boolean))};recognition.onend=()=>{speechDoneResolveRef.current?.();speechDoneResolveRef.current=null;if(cancelRef.current)return;const text=speechTextRef.current.trim();setRecording(false);if(text)onTranscript(text);else setError(copy.noSpeech)};recognition.onerror=(event:any)=>{setDiagnostic((language==='de'?'Spracherkennungsfehler: ':'Speech recognition error: ')+String(event?.error||'unknown'));speechDoneResolveRef.current?.();speechDoneResolveRef.current=null;setRecording(false);if(cancelRef.current)return;const code=String(event?.error||'');setError(code==='not-allowed'||code==='service-not-allowed'?copy.permission:copy.failed)};recognition.start();speechRef.current=recognition;setRecording(true);return}catch{}}
    setDiagnostic(ar?'المسار: Whisper Large V3 مع استرجاع العربية':language==='de'?'Pfad: lokales Whisper-Fallback':'Path: local Whisper fallback');if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined'){setError(copy.unsupported);return}
    try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});if(cancelRef.current||captureRequestRef.current!==requestId||!isOpenRef.current){stream.getTracks().forEach(track=>track.stop());return}streamRef.current=stream;chunksRef.current=[];const recorder=new MediaRecorder(stream);if(cancelRef.current||captureRequestRef.current!==requestId||!isOpenRef.current){stream.getTracks().forEach(track=>track.stop());streamRef.current=null;return}recorderRef.current=recorder;recorder.ondataavailable=e=>{if(e.data.size)chunksRef.current.push(e.data)};recorder.onstop=async()=>{const blob=new Blob(chunksRef.current,{type:recorder.mimeType||'audio/webm'});const cancelled=cancelRef.current;cleanup();setRecording(false);if(cancelled||!blob.size)return;setProcessing(true);try{const text=await transcribeVoiceRecording(blob,language);if(cancelRef.current||captureRequestRef.current!==requestId||!isOpenRef.current)return;if(!text)throw new Error('empty transcript');setLastTranscript(text);setDiagnostic(language==='de'?'Whisper-Transkript bereit — Nachricht wird verstanden':ar?'تم النسخ بـ Whisper — جارٍ فهم الرسالة':'Whisper transcription ready — understanding message');onTranscript(text)}catch{if(cancelRef.current||captureRequestRef.current!==requestId||!isOpenRef.current)return;setError(language==='de'?'Die Aufnahme konnte nicht verstanden werden. Versuch es erneut oder gib sie manuell ein.':ar?'لم نستطع فهم التسجيل. جرّب مرة أخرى أو اكتبها يدوياً.':'We could not understand the recording. Try again or type it manually.')}finally{if(captureRequestRef.current===requestId&&isOpenRef.current)setProcessing(false)}};recorder.start(250);setRecording(true)}catch{if(captureRequestRef.current!==requestId||cancelRef.current||!isOpenRef.current)return;cleanup();setError(copy.permission)}};
  const stop=()=>{if(speechRef.current){try{speechRef.current.stop()}catch{}return}if(recorderRef.current?.state==='recording')recorderRef.current.stop()};const back=()=>{restoreFocusRef.current=false;leave(onBack)};
  return <div ref={dialogRef} tabIndex={-1} data-profile-onboarding={mode==='profile'?'true':undefined} className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-[#25231F]/55 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="voice-capture-title" aria-describedby="voice-capture-description"><section className="w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] bg-[#FCFAF6] p-5 sm:p-6 shadow-2xl"><div className="flex items-center justify-between"><button type="button" onClick={back} className="w-10 h-10 rounded-full bg-white border border-[#E6E1D8] flex items-center justify-center" aria-label={copy.back}><ArrowLeft className={`w-4 h-4 ${ar?'rotate-180':''}`}/></button><button ref={closeButtonRef} type="button" onClick={()=>leave(onClose)} className="w-10 h-10 rounded-full bg-white border border-[#E6E1D8] flex items-center justify-center" aria-label={copy.close}><X className="w-4 h-4"/></button></div><div className="mt-5 text-center"><h2 id="voice-capture-title" className="text-2xl font-display font-black text-[#252824]">{titleCopy.title}</h2><p id="voice-capture-description" className="mt-2 text-sm text-[#77736B]">{titleCopy.subtitle}</p></div><div className="mt-7 flex flex-col items-center"><button type="button" disabled={processing} onClick={recording?stop:start} className={`w-24 h-24 rounded-full grid place-items-center text-white shadow-xl transition ${recording?'bg-[#C94C3F]':'bg-[#293D34]'} disabled:opacity-60`} aria-label={recording?copy.stop:copy.start}>{processing?<LoaderCircle className="w-8 h-8 animate-spin"/>:recording?<Square className="w-8 h-8 fill-current"/>:<Mic2 className="w-9 h-9"/>}</button><p className="mt-4 text-sm font-black text-[#4A4C46]">{processing?copy.processing:recording?String(seconds)+'s':copy.idle}</p>{lastTranscript&&<div data-testid="voice-raw-transcript" className="mt-4 w-full rounded-2xl bg-[#F3F0E9] px-4 py-3 text-start"><p className="mt-1 text-xs font-semibold text-[#343631]" dir="auto">{lastTranscript}</p></div>}{diagnostic&&<p data-testid="voice-diagnostic" className="mt-4 rounded-2xl bg-white px-4 py-3 text-[11px] font-bold text-[#6D6A63] border border-[#E6E1D8]">{diagnostic}</p>}{error&&<p className="mt-3 rounded-2xl bg-[#FCE9E5] px-4 py-3 text-xs font-bold text-[#9B453A]">{error}</p>}</div></section></div>;
};
