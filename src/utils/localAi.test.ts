import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

class FakeWorker {
  static instances:FakeWorker[]=[];
  onmessage:((event:MessageEvent)=>void)|null=null;
  onerror:((event:ErrorEvent)=>void)|null=null;
  messages:any[]=[];
  terminated=false;
  constructor(public url:string,public options:any){FakeWorker.instances.push(this)}
  postMessage(message:any){this.messages.push(message)}
  terminate(){this.terminated=true}
  reply(data:any){this.onmessage?.({data} as MessageEvent)}
  fail(message='worker failed'){this.onerror?.({message} as ErrorEvent)}
}

class FakeAudioContext {
  static sourceRate=48000;
  static channels=[
    new Float32Array([0,.2,.4,.6,.8,1,.8,.6,.4,.2,0,-.2]),
    new Float32Array([0,.1,.2,.3,.4,.5,.4,.3,.2,.1,0,-.1]),
  ];
  async decodeAudioData(_data:ArrayBuffer){
    const channels=FakeAudioContext.channels;
    return {
      numberOfChannels:channels.length,
      length:channels[0].length,
      sampleRate:FakeAudioContext.sourceRate,
      getChannelData:(index:number)=>channels[index],
    } as AudioBuffer;
  }
  async close(){}
}

async function getPostedWorker(){
  for(let i=0;i<10&&!FakeWorker.instances[0]?.messages.length;i++)await Promise.resolve();
  const worker=FakeWorker.instances[0];
  if(!worker?.messages.length)throw new Error('worker message was not posted');
  return worker;
}

describe('local browser AI client',()=>{
  beforeEach(()=>{
    FakeWorker.instances=[];
    FakeAudioContext.sourceRate=48000;
    vi.stubGlobal('Worker',FakeWorker as any);
    vi.stubGlobal('window',{AudioContext:FakeAudioContext});
    vi.resetModules();
  });
  afterEach(()=>vi.unstubAllGlobals());

  it('sends a food photo to the local worker and returns ranked results',async()=>{
    const {recognizeFoodImage}=await import('./localAi');
    const blob=new Blob(['photo'],{type:'image/jpeg'});
    const promise=recognizeFoodImage(blob);
    const worker=await getPostedWorker();
    expect(worker.options).toEqual({type:'module'});
    expect(worker.messages[0].type).toBe('image');
    expect(worker.messages[0].blob).toBe(blob);
    worker.reply({id:worker.messages[0].id,type:'result',results:[{label:'boiled eggs',score:.82},{label:'omelette',score:.11}]});
    await expect(promise).resolves.toEqual([{label:'boiled eggs',score:.82},{label:'omelette',score:.11}]);
  });

  it('decodes microphone audio, resamples it to 16 kHz mono, and passes Arabic to Whisper',async()=>{
    const {transcribeAudio}=await import('./localAi');
    const promise=transcribeAudio(new Blob(['voice'],{type:'audio/webm'}),'ar');
    const worker=await getPostedWorker();
    const posted=worker.messages[0];
    expect(posted.type).toBe('audio');
    expect(posted.language).toBe('ar');
    expect(posted.audio).toBeInstanceOf(Float32Array);
    expect(posted.audio.length).toBe(Math.round(FakeAudioContext.channels[0].length*16000/48000));
    expect(posted.blob).toBeUndefined();
    worker.reply({id:posted.id,type:'result',text:'  كليت بيض مسلوق  '});
    await expect(promise).resolves.toBe('كليت بيض مسلوق');
  });

  it('keeps 16 kHz audio length unchanged and preserves mixed-language transcript text',async()=>{
    FakeAudioContext.sourceRate=16000;
    const {transcribeAudio}=await import('./localAi');
    const promise=transcribeAudio(new Blob(['voice']),'ar');
    const worker=await getPostedWorker();
    expect(worker.messages[0].audio.length).toBe(FakeAudioContext.channels[0].length);
    worker.reply({id:worker.messages[0].id,type:'result',text:'كليت omelette بالجبن'});
    await expect(promise).resolves.toBe('كليت omelette بالجبن');
  });

  it('ignores worker loading status and waits for the actual result',async()=>{
    const {transcribeAudio}=await import('./localAi');
    let settled=false;
    const promise=transcribeAudio(new Blob(['voice']),'en').finally(()=>{settled=true});
    const worker=await getPostedWorker();
    worker.reply({id:999,type:'status',status:'progress'});
    await Promise.resolve();
    expect(settled).toBe(false);
    worker.reply({id:worker.messages[0].id,type:'result',text:'coffee with milk'});
    await expect(promise).resolves.toBe('coffee with milk');
  });

  it('rejects model errors instead of inventing a recognition',async()=>{
    const {recognizeFoodImage}=await import('./localAi');
    const promise=recognizeFoodImage(new Blob(['bad']));
    const worker=await getPostedWorker();
    worker.reply({id:worker.messages[0].id,type:'error',message:'model unavailable'});
    await expect(promise).rejects.toThrow('model unavailable');
  });

  it('rejects pending work and recreates the worker after a crash',async()=>{
    const {transcribeAudio}=await import('./localAi');
    const first=transcribeAudio(new Blob(['voice']),'ar');
    const worker1=await getPostedWorker();
    worker1.fail('WASM failed');
    await expect(first).rejects.toThrow('WASM failed');
    const second=transcribeAudio(new Blob(['voice2']),'ar');
    for(let i=0;i<10&&FakeWorker.instances.length<2;i++)await Promise.resolve();
    expect(FakeWorker.instances).toHaveLength(2);
    const worker2=FakeWorker.instances[1];
    for(let i=0;i<10&&!worker2.messages.length;i++)await Promise.resolve();
    worker2.reply({id:worker2.messages[0].id,type:'result',text:'حريرة'});
    await expect(second).resolves.toBe('حريرة');
  });

  it('fails clearly when the browser cannot decode recorded audio',async()=>{
    class BrokenAudioContext extends FakeAudioContext{
      async decodeAudioData(){throw new Error('decode failed')}
    }
    vi.stubGlobal('window',{AudioContext:BrokenAudioContext});
    vi.resetModules();
    const {transcribeAudio}=await import('./localAi');
    await expect(transcribeAudio(new Blob(['bad-audio']),'ar')).rejects.toThrow('decode failed');
    expect(FakeWorker.instances).toHaveLength(0);
  });
});
