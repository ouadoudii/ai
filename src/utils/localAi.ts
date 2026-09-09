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

async function decodeAudioTo16kMono(blob:Blob):Promise<Float32Array>{
  const AudioContextCtor=window.AudioContext||(window as any).webkitAudioContext;
  if(!AudioContextCtor)throw new Error('AudioContext unavailable');
  const ctx=new AudioContextCtor();
  try{
    const buffer=await ctx.decodeAudioData(await blob.arrayBuffer());
    const channels=buffer.numberOfChannels;
    const frames=buffer.length;
    const mono=new Float32Array(frames);
    for(let ch=0;ch<channels;ch++){
      const data=buffer.getChannelData(ch);
      for(let i=0;i<frames;i++)mono[i]+=data[i]/channels;
    }
    if(buffer.sampleRate===16000)return mono;
    const outLength=Math.max(1,Math.round(mono.length*16000/buffer.sampleRate));
    const out=new Float32Array(outLength);
    const ratio=buffer.sampleRate/16000;
    for(let i=0;i<outLength;i++){
      const pos=i*ratio;
      const left=Math.floor(pos);
      const right=Math.min(left+1,mono.length-1);
      const frac=pos-left;
      out[i]=mono[left]*(1-frac)+mono[right]*frac;
    }
    return out;
  }finally{
    await ctx.close().catch(()=>{});
  }
}

export async function transcribeAudio(blob:Blob,language:'ar'|'en'):Promise<string>{
  const audio=await decodeAudioTo16kMono(blob);
  const result=await runLocalAi<{text:string}>({type:'audio',audio,language});
  return String(result.text||'').trim();
}
