import React from 'react';
import { createPortal } from 'react-dom';
import { Keyboard, Mic2 } from 'lucide-react';
import { AppLanguage, useLanguage } from '../i18n';

export const VOICE_FIRST_ENTRY_SEEN_KEY='rhythm_voice_entry_seen_v1';
export const PROFILE_INTRO_KEY='rhythm_intro_profile_v1';

export function voiceFirstEntryCopy(language:AppLanguage){
  if(language==='ar')return{
    prompt:'ما الذي أتى بك إلينا؟ احكِ لي قليلاً عنك.',
    helper:'تكلم بطريقتك — ما الذي تريد تغييره أو فهمه بشكل أفضل في يومك؟',
    start:'ابدأ بالكلام',
    type:'أفضل الكتابة',
    skip:'أحكي لاحقاً',
    hint:'سأحوّل ما تقوله إلى مسودة ملف يمكنك مراجعتها قبل الحفظ.'
  };
  if(language==='de')return{
    prompt:'Was führt dich zu uns? Erzähl ein bisschen von dir.',
    helper:'Sprich einfach frei — was möchtest du verändern oder in deinem Alltag besser verstehen?',
    start:'Erzählen',
    type:'Lieber tippen',
    skip:'Später erzählen',
    hint:'Ich mache daraus einen Profil-Entwurf, den du vor dem Speichern prüfen kannst.'
  };
  if(language==='fr')return{
    prompt:"Qu’est-ce qui t’amène ici ? Parle-moi un peu de toi.",
    helper:"Parle librement — qu’aimerais-tu changer ou mieux comprendre dans ton quotidien ?",
    start:'Raconter',
    type:'Je préfère écrire',
    skip:'Raconter plus tard',
    hint:'J’en ferai un brouillon de profil que tu pourras vérifier avant de l’enregistrer.'
  };
  return{
    prompt:'What brings you here? Tell me a little about you.',
    helper:'Just speak freely — what would you like to change or understand better in everyday life?',
    start:'Tell me',
    type:'I’d rather type',
    skip:'Tell you later',
    hint:'I’ll turn it into a profile draft you can review before anything is saved.'
  };
}

export function shouldShowVoiceFirstEntry(storage:Pick<Storage,'getItem'>){
  return storage.getItem(VOICE_FIRST_ENTRY_SEEN_KEY)!=='true'&&!storage.getItem(PROFILE_INTRO_KEY);
}

interface Props{onStart:()=>void;onType:()=>void;}

export const VoiceFirstEntryOverlay:React.FC<Props>=({onStart,onType})=>{
  const {language}=useLanguage();
  const copy=voiceFirstEntryCopy(language);
  const micRef=React.useRef<HTMLButtonElement|null>(null);
  const typeRef=React.useRef<HTMLButtonElement|null>(null);
  const skipRef=React.useRef<HTMLButtonElement|null>(null);
  const [isOpen,setIsOpen]=React.useState(()=>{
    try{return shouldShowVoiceFirstEntry(localStorage)}catch{return true}
  });
  const [portalReady,setPortalReady]=React.useState(false);

  React.useEffect(()=>setPortalReady(true),[]);
  React.useEffect(()=>{
    if(!isOpen||!portalReady||typeof document==='undefined')return;
    const root=document.getElementById('root');
    const previousOverflow=document.body.style.overflow;
    const previousAriaHidden=root?.getAttribute('aria-hidden');
    const wasInert=root?.hasAttribute('inert')??false;
    document.body.style.overflow='hidden';
    root?.setAttribute('inert','');
    root?.setAttribute('aria-hidden','true');
    const frame=window.requestAnimationFrame(()=>micRef.current?.focus({preventScroll:true}));
    const keepFocus=(event:KeyboardEvent)=>{
      if(event.key!=='Tab')return;
      const first=micRef.current;
      const last=skipRef.current;
      if(!first||!last)return;
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus({preventScroll:true});}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus({preventScroll:true});}
    };
    document.addEventListener('keydown',keepFocus,true);
    return()=>{
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown',keepFocus,true);
      document.body.style.overflow=previousOverflow;
      if(root){
        if(!wasInert)root.removeAttribute('inert');
        if(previousAriaHidden===null)root.removeAttribute('aria-hidden');
        else root.setAttribute('aria-hidden',previousAriaHidden);
      }
    };
  },[isOpen,portalReady]);

  if(!isOpen||!portalReady||typeof document==='undefined')return null;

  const dismiss=(persist=false)=>{
    if(persist){try{localStorage.setItem(VOICE_FIRST_ENTRY_SEEN_KEY,'true')}catch{}}
    setIsOpen(false);
  };
  const start=()=>{dismiss();onStart();};
  const type=()=>{dismiss();onType();};

  return createPortal(
    <div data-testid="voice-first-entry-overlay" className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[#211F1B]/72 px-5 py-8 backdrop-blur-xl" role="dialog" aria-modal="true" aria-labelledby="voice-first-entry-title" aria-describedby="voice-first-entry-description">
      <section className="w-full max-w-md text-center" dir={language==='ar'?'rtl':'ltr'}>
        <p className="text-xs font-black uppercase tracking-[0.28em] text-white/65">Rhythm</p>
        <h1 id="voice-first-entry-title" className="mt-5 text-4xl font-display font-black leading-tight text-white sm:text-5xl">{copy.prompt}</h1>
        <p id="voice-first-entry-description" className="mx-auto mt-4 max-w-sm text-base font-medium leading-7 text-white/75">{copy.helper}</p>
        <div className="mt-10 flex justify-center">
          <button ref={micRef} data-testid="voice-first-entry-mic" type="button" onClick={start} aria-label={copy.start} className="group relative grid h-32 w-32 place-items-center rounded-full bg-[#F4EEE4] text-[#293D34] shadow-[0_24px_80px_rgba(0,0,0,.38)] outline-none transition-transform active:scale-95 focus-visible:ring-4 focus-visible:ring-white/70">
            <span aria-hidden="true" className="absolute inset-0 rounded-full border border-white/40 motion-safe:animate-ping"/>
            <Mic2 className="relative h-12 w-12 stroke-[2.2] transition-transform group-hover:scale-105"/>
          </button>
        </div>
        <p className="mx-auto mt-6 max-w-sm text-sm font-bold leading-6 text-white/80">{copy.hint}</p>
        <button ref={typeRef} data-testid="voice-first-entry-type" type="button" onClick={type} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 px-5 py-2 text-sm font-black text-white outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/80"><Keyboard className="h-4 w-4"/>{copy.type}</button>
        <div><button ref={skipRef} data-testid="voice-first-entry-skip" type="button" onClick={()=>dismiss(true)} className="mt-3 min-h-11 rounded-full px-5 py-2 text-sm font-black text-white/80 underline decoration-white/40 underline-offset-4 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white/80">{copy.skip}</button></div>
      </section>
    </div>,
    document.body
  );
};
