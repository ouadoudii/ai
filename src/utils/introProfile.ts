import { AppLanguage } from '../i18n';

export const INTRO_PROFILE_STORAGE_KEY='rhythm_intro_profile_v1';

export type PlanPhase='morning'|'midday'|'evening';

export interface PersonalFirstPlan{
  title:string;
  rationale:string;
  focusAreas:string[];
  firstStep:string;
  phase:PlanPhase;
}

export interface IntroProfileDraft{
  summary:string;
  priorities:string[];
  preferences:string[];
  rawIntro:string;
  firstPlan:PersonalFirstPlan;
}

export interface IntroProfile extends IntroProfileDraft{
  confirmedAt:number;
}

const cleanList=(value:unknown,max=5)=>Array.isArray(value)
  ? value.filter((item):item is string=>typeof item==='string').map(item=>item.trim()).filter(Boolean).slice(0,max)
  : [];

const cleanPhase=(value:unknown):PlanPhase=>value==='morning'||value==='midday'||value==='evening'?value:'midday';

const extractJson=(value:string)=>{
  const trimmed=value.trim();
  const fenced=trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate=(fenced||trimmed).trim();
  const start=candidate.indexOf('{');
  const end=candidate.lastIndexOf('}');
  return start>=0&&end>start?candidate.slice(start,end+1):candidate;
};

const fallbackPlan=(rawIntro:string,language:AppLanguage='de'):PersonalFirstPlan=>{
  const copy={
    de:{title:'Dein erster Schritt',step:'Beobachte beim nächsten Check-in, was dir im Alltag auffällt.'},
    en:{title:'Your first step',step:'At your next check-in, notice what stands out in your everyday rhythm.'},
    fr:{title:'Ton premier pas',step:'Au prochain check-in, observe simplement ce qui ressort de ton quotidien.'},
    ar:{title:'خطوتك الأولى',step:'في تسجيلك القادم، لاحظ ببساطة ما يبرز في إيقاع يومك.'},
  }[language];
  return{title:copy.title,rationale:rawIntro.trim().slice(0,220),focusAreas:[],firstStep:copy.step,phase:'midday'};
};

export function safeIntroProfileDraft(value:unknown,rawIntro:string,language:AppLanguage='de'):IntroProfileDraft{
  const data=value&&typeof value==='object'?value as Record<string,unknown>:{};
  const planData=data.firstPlan&&typeof data.firstPlan==='object'?data.firstPlan as Record<string,unknown>:{};
  const fallback=fallbackPlan(rawIntro,language);
  return{
    summary:typeof data.summary==='string'&&data.summary.trim()?data.summary.trim().slice(0,420):rawIntro.trim().slice(0,420),
    priorities:cleanList(data.priorities),
    preferences:cleanList(data.preferences),
    rawIntro:rawIntro.trim().slice(0,3000),
    firstPlan:{
      title:typeof planData.title==='string'&&planData.title.trim()?planData.title.trim().slice(0,120):fallback.title,
      rationale:typeof planData.rationale==='string'&&planData.rationale.trim()?planData.rationale.trim().slice(0,420):fallback.rationale,
      focusAreas:cleanList(planData.focusAreas,3),
      firstStep:typeof planData.firstStep==='string'&&planData.firstStep.trim()?planData.firstStep.trim().slice(0,260):fallback.firstStep,
      phase:cleanPhase(planData.phase),
    },
  };
}

const languageName:Record<AppLanguage,string>={de:'German',en:'English',fr:'French',ar:'Arabic'};

export async function createIntroProfileDraft(rawIntro:string,language:AppLanguage):Promise<IntroProfileDraft>{
  const intro=rawIntro.trim();
  if(!intro)return safeIntroProfileDraft({},'',language);
  const prompt=`Create a provisional onboarding profile AND one small personal first plan from the user's own introduction below. Return ONLY valid JSON with exactly these top-level keys: summary (string), priorities (array of short strings), preferences (array of short strings), firstPlan (object). firstPlan must contain exactly: title (string), rationale (string), focusAreas (array of 1-3 short strings), firstStep (one concrete observation/check-in instruction), phase (one of morning, midday, evening). Write all user-facing text in ${languageName[language]}. Choose the plan semantically from the whole message, not from keyword matching. Use only information the user explicitly stated. Do not infer health conditions, diagnoses, religion, ethnicity, politics, sexuality, or other sensitive attributes. Do not invent facts or promise outcomes. Prefer one focused, low-friction observation for the next few days over generic advice. Keep summary under 70 words, priorities max 5, preferences max 5. User introduction: ${JSON.stringify(intro)}`;
  try{
    const res=await fetch('/api/coach-chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:prompt,moments:[],checkIns:[]})});
    if(!res.ok)throw new Error(`API returned status ${res.status}`);
    const payload=await res.json();
    const reply=typeof payload?.reply==='string'?payload.reply:'';
    const parsed=JSON.parse(extractJson(reply));
    return safeIntroProfileDraft(parsed,intro,language);
  }catch(error){
    console.warn('Could not create AI intro profile; keeping a user-editable local draft.',error);
    return safeIntroProfileDraft({},intro,language);
  }
}

export function saveIntroProfile(draft:IntroProfileDraft){
  const profile:IntroProfile={...safeIntroProfileDraft(draft,draft.rawIntro),confirmedAt:Date.now()};
  try{localStorage.setItem(INTRO_PROFILE_STORAGE_KEY,JSON.stringify(profile))}catch{}
  return profile;
}

export function loadIntroProfile():IntroProfile|null{
  try{
    const raw=localStorage.getItem(INTRO_PROFILE_STORAGE_KEY);
    if(!raw)return null;
    const parsed=JSON.parse(raw) as Record<string,unknown>;
    if(typeof parsed.confirmedAt!=='number'||typeof parsed.rawIntro!=='string')return null;
    const safe=safeIntroProfileDraft(parsed,parsed.rawIntro);
    return{...safe,confirmedAt:parsed.confirmedAt};
  }catch{
    return null;
  }
}
