type LocalAiImageResult={label:string;score:number};
type Pending={resolve:(value:any)=>void;reject:(reason?:any)=>void};
let worker:Worker|null=null;
let seq=0;
const pending=new Map<number,Pending>();

function getWorker(){
  if(worker)return worker;
  worker=new Worker('/local-ai-worker.js',{type:'module'});
  worker.onmessage=(event)=>{
    const data=event.data||{};
    if(data.type==='status')return;
    const slot=pending.get(data.id);
    if(!slot)return;
    pending.delete(data.id);
    if(data.type==='error')slot.reject(new Error(data.message||'Local AI failed'));
    else slot.resolve(data);
  };
  worker.onerror=(event)=>{
    const err=new Error(event.message||'Local AI worker failed');
    for(const slot of pending.values())slot.reject(err);
    pending.clear();
    worker?.terminate();
    worker=null;
  };
  return worker;
}

function runLocalAi<T>(payload:Record<string,unknown>):Promise<T>{
  return new Promise((resolve,reject)=>{
    const id=++seq;
    pending.set(id,{resolve,reject});
    getWorker().postMessage({id,...payload});
  });
}

export async function recognizeFoodImage(blob:Blob):Promise<LocalAiImageResult[]>{
  const result=await runLocalAi<{results:LocalAiImageResult[]}>({type:'image',blob});
  return Array.isArray(result.results)?result.results:[];
}

export async function transcribeAudio(blob:Blob,language:'ar'|'en'):Promise<string>{
  const result=await runLocalAi<{text:string}>({type:'audio',blob,language});
  return String(result.text||'').trim();
}
