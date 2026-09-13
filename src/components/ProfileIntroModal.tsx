import React from 'react';
import { LoaderCircle, PencilLine, Sparkles, X } from 'lucide-react';
import { AppLanguage, useLanguage } from '../i18n';
import { createIntroProfileDraft, IntroProfileDraft, saveIntroProfile } from '../utils/introProfile';

const copyFor=(language:AppLanguage)=>{
  if(language==='de')return{title:'So habe ich dich verstanden',subtitle:'Das ist nur ein erster Entwurf. Du entscheidest, was davon in deinem Profil bleibt.',typeTitle:'Erzähl mir ein bisschen von dir',typeHelp:'Was führt dich zu uns? Was möchtest du verändern oder besser verstehen?',placeholder:'Zum Beispiel: Ich möchte regelmäßiger essen, besser verstehen, wann ich müde werde und weniger nebenbei snacken …',build:'Profil erstellen',loading:'Ich fasse das für dich zusammen …',summary:'Kurz über dich',priorities:'Was dir wichtig ist',preferences:'Was dir gut passt',plan:'Dein persönlicher Startplan',firstStep:'Dein erster Check-in',confirm:'Profil & Plan übernehmen',edit:'Bearbeiten',cancel:'Später'};
  if(language==='fr')return{title:"Voilà ce que j’ai compris",subtitle:'Ce n’est qu’un premier brouillon. Tu choisis ce qui reste dans ton profil.',typeTitle:'Parle-moi un peu de toi',typeHelp:"Qu’est-ce qui t’amène ici ? Qu’aimerais-tu changer ou mieux comprendre ?",placeholder:'Par exemple : je veux manger plus régulièrement, comprendre mes coups de fatigue …',build:'Créer mon profil',loading:'Je résume ce que tu viens de partager …',summary:'En bref',priorities:'Ce qui compte pour toi',preferences:'Ce qui te convient',plan:'Ton plan de départ personnalisé',firstStep:'Ton premier check-in',confirm:'Valider le profil et le plan',edit:'Modifier',cancel:'Plus tard'};
  if(language==='ar')return{title:'هكذا فهمتك',subtitle:'هذا مجرد مسودة أولى. أنت تقرر ما يبقى في ملفك.',typeTitle:'احكِ لي قليلاً عنك',typeHelp:'ما الذي أتى بك إلى هنا؟ ما الذي تريد تغييره أو فهمه بشكل أفضل؟',placeholder:'مثلاً: أريد أن أنظم أكلي أكثر وأفهم متى تنخفض طاقتي …',build:'أنشئ ملفي',loading:'ألخّص ما شاركته الآن …',summary:'نبذة عنك',priorities:'ما يهمك',preferences:'ما يناسبك',plan:'خطة البداية الخاصة بك',firstStep:'أول تسجيل لك',confirm:'اعتماد الملف والخطة',edit:'تعديل',cancel:'لاحقاً'};
  return{title:'Here’s what I understood',subtitle:'This is only a first draft. You decide what stays in your profile.',typeTitle:'Tell me a little about you',typeHelp:'What brings you here? What would you like to change or understand better?',placeholder:'For example: I want to eat more regularly, understand my energy dips and snack less mindlessly …',build:'Create my profile',loading:'I’m turning that into a short profile …',summary:'About you',priorities:'What matters to you',preferences:'What works for you',plan:'Your personal starting plan',firstStep:'Your first check-in',confirm:'Use profile & plan',edit:'Edit',cancel:'Later'};
};

interface Props{
  isOpen:boolean;
  initialTranscript?:string;
  onClose:()=>void;
  onSaved:()=>void;
}

export const ProfileIntroModal:React.FC<Props>=({isOpen,initialTranscript='',onClose,onSaved})=>{
  const {language}=useLanguage();
  const copy=copyFor(language);
  const [intro,setIntro]=React.useState(initialTranscript);
  const [draft,setDraft]=React.useState<IntroProfileDraft|null>(null);
  const [loading,setLoading]=React.useState(false);

  React.useEffect(()=>{
    if(!isOpen)return;
    setIntro(initialTranscript);
    setDraft(null);
    if(initialTranscript.trim())void build(initialTranscript);
  },[isOpen,initialTranscript,language]);

  if(!isOpen)return null;

  async function build(value=intro){
    const clean=value.trim();
    if(!clean)return;
    setLoading(true);
    const next=await createIntroProfileDraft(clean,language);
    setDraft(next);
    setLoading(false);
  }

  const updateList=(key:'priorities'|'preferences',value:string)=>{
    if(!draft)return;
    const items=value.split('\n').map(item=>item.trim()).filter(Boolean).slice(0,5);
    setDraft({...draft,[key]:items});
  };

  return <div className="fixed inset-0 z-[95] flex items-end justify-center bg-[#211F1B]/70 p-0 backdrop-blur-lg sm:items-center sm:p-5" role="dialog" aria-modal="true">
    <section className="max-h-[92vh] w-full overflow-y-auto rounded-t-[32px] bg-[#FCFAF6] p-5 shadow-2xl sm:max-w-lg sm:rounded-[32px] sm:p-7" dir={language==='ar'?'rtl':'ltr'}>
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E9E2D6] text-[#293D34]"><Sparkles className="h-5 w-5"/></div>
        <button type="button" onClick={onClose} aria-label={copy.cancel} className="grid h-10 w-10 place-items-center rounded-full border border-[#E5DED3] bg-white"><X className="h-4 w-4"/></button>
      </div>
      {!draft&&!loading&&<>
        <h2 className="mt-6 text-3xl font-display font-black leading-tight text-[#252824]">{copy.typeTitle}</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-[#747067]">{copy.typeHelp}</p>
        <textarea data-testid="profile-intro-textarea" value={intro} onChange={e=>setIntro(e.target.value)} placeholder={copy.placeholder} rows={6} className="mt-5 w-full resize-none rounded-3xl border border-[#DDD5C9] bg-white px-4 py-4 text-base leading-6 outline-none focus:border-[#293D34] focus:ring-2 focus:ring-[#293D34]/15"/>
        <button data-testid="profile-intro-build" type="button" disabled={!intro.trim()} onClick={()=>void build()} className="mt-4 min-h-12 w-full rounded-2xl bg-[#293D34] px-5 py-3 font-black text-white disabled:opacity-40">{copy.build}</button>
      </>}
      {loading&&<div className="grid min-h-64 place-items-center text-center"><div><LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[#293D34]"/><p className="mt-4 font-black text-[#343631]">{copy.loading}</p></div></div>}
      {draft&&!loading&&<>
        <h2 className="mt-6 text-3xl font-display font-black leading-tight text-[#252824]">{copy.title}</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-[#747067]">{copy.subtitle}</p>
        <label className="mt-6 block text-sm font-black text-[#3D403A]">{copy.summary}
          <textarea data-testid="profile-summary" value={draft.summary} onChange={e=>setDraft({...draft,summary:e.target.value})} rows={4} className="mt-2 w-full resize-none rounded-2xl border border-[#DDD5C9] bg-white px-4 py-3 font-medium outline-none focus:border-[#293D34]"/>
        </label>
        <label className="mt-4 block text-sm font-black text-[#3D403A]">{copy.priorities}
          <textarea data-testid="profile-priorities" value={draft.priorities.join('\n')} onChange={e=>updateList('priorities',e.target.value)} rows={3} className="mt-2 w-full resize-none rounded-2xl border border-[#DDD5C9] bg-white px-4 py-3 font-medium outline-none focus:border-[#293D34]"/>
        </label>
        <label className="mt-4 block text-sm font-black text-[#3D403A]">{copy.preferences}
          <textarea data-testid="profile-preferences" value={draft.preferences.join('\n')} onChange={e=>updateList('preferences',e.target.value)} rows={3} className="mt-2 w-full resize-none rounded-2xl border border-[#DDD5C9] bg-white px-4 py-3 font-medium outline-none focus:border-[#293D34]"/>
        </label>
        <section data-testid="personal-first-plan" className="mt-5 rounded-[26px] bg-[#EEF1E8] p-5 text-[#293D34]">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#667463]">{copy.plan}</div>
          <h3 className="mt-2 text-xl font-black leading-tight">{draft.firstPlan.title}</h3>
          {draft.firstPlan.rationale&&<p className="mt-2 text-sm leading-6 text-[#5D675B]">{draft.firstPlan.rationale}</p>}
          {draft.firstPlan.focusAreas.length>0&&<div className="mt-3 flex flex-wrap gap-2">{draft.firstPlan.focusAreas.map(item=><span key={item} className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-black">{item}</span>)}</div>}
          <div className="mt-4 rounded-2xl bg-white p-4">
            <div className="text-xs font-black text-[#7A8177]">{copy.firstStep}</div>
            <p data-testid="personal-first-step" className="mt-1 text-sm font-black leading-6 text-[#343A32]">{draft.firstPlan.firstStep}</p>
          </div>
        </section>
        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
          <button data-testid="profile-confirm" type="button" onClick={()=>{saveIntroProfile(draft);onSaved()}} className="min-h-12 rounded-2xl bg-[#293D34] px-5 py-3 font-black text-white">{copy.confirm}</button>
          <button type="button" onClick={()=>setDraft(null)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#D8D0C4] px-5 py-3 font-black text-[#464942]"><PencilLine className="h-4 w-4"/>{copy.edit}</button>
        </div>
      </>}
    </section>
  </div>;
};
