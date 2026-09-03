export type UxEvent = {
  eventName:string;
  surface:string;
  language?:'en'|'ar';
  country?:string|null;
  durationMs?:number;
  outcome?:string;
  metadata?:Record<string,string|number|boolean|null>;
};

const SUPABASE_URL='https://iedexrvvmpymnyyursdx.supabase.co';
const SUPABASE_KEY='sb_publishable_6ZGjIW09VXZ8kT2vu1L2Kg_2JCmDg37';
const SESSION_KEY='rhythm_ux_session_v1';
const SAFE_META_KEYS=new Set(['flow','step','phase','source','category','has_photo','repeat','count','route','reason']);

export function getUxSessionId():string{
  try{
    const existing=localStorage.getItem(SESSION_KEY);
    if(existing)return existing;
    const id=(globalThis.crypto?.randomUUID?.()||('ux-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12))).slice(0,80);
    localStorage.setItem(SESSION_KEY,id);
    return id;
  }catch{return 'ux-no-storage';}
}

export function sanitizeUxMetadata(input:UxEvent['metadata']={}):Record<string,string|number|boolean|null>{
  const out:Record<string,string|number|boolean|null>={};
  for(const [key,value] of Object.entries(input||{})){
    if(!SAFE_META_KEYS.has(key))continue;
    if(value===null||typeof value==='boolean'||typeof value==='number')out[key]=value;
    else if(typeof value==='string')out[key]=value.slice(0,80);
  }
  return out;
}

export function buildUxPayload(event:UxEvent){
  return {
    session_id:getUxSessionId(),
    event_name:event.eventName.slice(0,80),
    surface:event.surface.slice(0,80),
    language:event.language==='ar'?'ar':'en',
    country:event.country&&/^[A-Z]{2}$/.test(event.country)?event.country:null,
    duration_ms:Number.isFinite(event.durationMs)?Math.max(0,Math.min(3600000,Math.round(event.durationMs!))):null,
    outcome:event.outcome?event.outcome.slice(0,40):null,
    metadata:sanitizeUxMetadata(event.metadata),
  };
}

export function trackUx(event:UxEvent):void{
  if(typeof window==='undefined')return;
  const payload=buildUxPayload(event);
  fetch(SUPABASE_URL+'/rest/v1/ux_events',{
    method:'POST',
    keepalive:true,
    headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},
    body:JSON.stringify(payload),
  }).catch(()=>undefined);
}

export function startUxFlow(surface:string,language:'en'|'ar',metadata:UxEvent['metadata']={}){
  const started=Date.now();
  trackUx({eventName:'flow_started',surface,language,metadata});
  return (outcome:'completed'|'cancelled'|'switched',extra:UxEvent['metadata']={})=>{
    trackUx({eventName:'flow_finished',surface,language,durationMs:Date.now()-started,outcome,metadata:{...metadata,...extra}});
  };
}
