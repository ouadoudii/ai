import React from 'react';
import { createPortal } from 'react-dom';
import { Mic2 } from 'lucide-react';
import { AppLanguage, useLanguage } from '../i18n';

export const VOICE_FIRST_ENTRY_SEEN_KEY='rhythm_voice_entry_seen_v1';

export function voiceFirstEntryCopy(language:AppLanguage){
  if(language==='ar')return{
    prompt:'احكي لي كيف كان يومك.',
    helper:'الأكل، النوم، الطاقة أو المزاج — احكِ بطريقتك.',
    start:'ابدأ بالكلام',
    hint:'اضغط على الميكروفون وتكلم براحتك.'
  };
  if(language==='de')return{
    prompt:'Erzähl mir, wie dein Tag war.',
    helper:'Essen, Schlaf, Energie oder Stimmung — sprich einfach frei.',
    start:'Erzählen',
    hint:'Tippe aufs Mikro und sprich einfach los.'
  };
  if(language==='fr')return{
    prompt:'Raconte-moi ta journée.',
    helper:'Repas, sommeil, énergie ou humeur — parle simplement avec tes mots.',
    start:'Raconter',
    hint:'Appuie sur le micro et commence à parler.'
  };
  return{
    prompt:'Tell me how your day was.',
    helper:'Food, sleep, energy or mood — just say it in your own words.',
    start:'Tell me',
    hint:'Tap the microphone and start talking.'
  };
}

interface Props{onStart:()=>void;}

export const VoiceFirstEntryOverlay:React.FC<Props>=({onStart})=>{
  const {language}=useLanguage();
  const copy=voiceFirstEntryCopy(language);
  const micRef=React.useRef<HTMLButtonElement|null>(null);
  const [isOpen,setIsOpen]=React.useState(()=>{
    try{return localStorage.getItem(VOICE_FIRST_ENTRY_SEEN_KEY)!=='true'}catch{return true}
  });
  const [portalReady,setPortalReady]=React.useState(false);

  React.useEffect(()=>setPortalReady(true),[]);
  React.useEffect(()=>{
    if(!isOpen||typeof document==='undefined')return;
    const root=document.getElementById('root');
    const previousOverflow=document.body.style.overflow;
    const previousAriaHidden=root?.getAttribute('aria-hidden');
    const wasInert=root?.hasAttribute('inert')??false;
    document.body.style.overflow='hidden';
    root?.setAttribute('inert','');
    root?.setAttribute('aria-hidden','true');
    const frame=window.requestAnimationFrame(()=>micRef.current?.focus());
    const keepFocus=(event:KeyboardEvent)=>{
      if(event.key==='Tab'){
        event.preventDefault();
        micRef.current?.focus();
      }
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
  },[isOpen]);

  if(!isOpen||!portalReady||typeof document==='undefined')return null;

  const start=()=>{
    try{localStorage.setItem(VOICE_FIRST_ENTRY_SEEN_KEY,'true')}catch{}
    setIsOpen(false);
    onStart();
  };

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
        <p className="mt-6 text-sm font-bold text-white/80">{copy.hint}</p>
      </section>
    </div>,
    document.body
  );
};
