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

describe('local browser AI client',()=>{
  beforeEach(async()=>{
    FakeWorker.instances=[];
    vi.stubGlobal('Worker',FakeWorker as any);
    vi.resetModules();
  });
  afterEach(()=>vi.unstubAllGlobals());

  it('sends a food photo to the local worker and returns ranked results',async()=>{
    const {recognizeFoodImage}=await import('./localAi');
    const blob=new Blob(['photo'],{type:'image/jpeg'});
    const promise=recognizeFoodImage(blob);
    const worker=FakeWorker.instances[0];
    expect(worker.options).toEqual({type:'module'});
    expect(worker.messages[0].type).toBe('image');
    expect(worker.messages[0].blob).toBe(blob);
    worker.reply({id:worker.messages[0].id,type:'result',results:[{label:'boiled eggs',score:.82},{label:'omelette',score:.11}]});
    await expect(promise).resolves.toEqual([{label:'boiled eggs',score:.82},{label:'omelette',score:.11}]);
  });

  it('passes Arabic language to Whisper transcription',async()=>{
    const {transcribeAudio}=await import('./localAi');
    const audio=new Blob(['voice'],{type:'audio/webm'});
    const promise=transcribeAudio(audio,'ar');
    const worker=FakeWorker.instances[0];
    expect(worker.messages[0]).toMatchObject({type:'audio',blob:audio,language:'ar'});
    worker.reply({id:worker.messages[0].id,type:'result',text:'  كليت بيض مسلوق  '});
    await expect(promise).resolves.toBe('كليت بيض مسلوق');
  });

  it('keeps mixed-language transcript text intact',async()=>{
    const {transcribeAudio}=await import('./localAi');
    const promise=transcribeAudio(new Blob(['voice']),'ar');
    const worker=FakeWorker.instances[0];
    worker.reply({id:worker.messages[0].id,type:'result',text:'كليت omelette بالجبن'});
    await expect(promise).resolves.toBe('كليت omelette بالجبن');
  });

  it('ignores worker loading status and waits for the actual result',async()=>{
    const {transcribeAudio}=await import('./localAi');
    let settled=false;
    const promise=transcribeAudio(new Blob(['voice']),'en').finally(()=>{settled=true});
    const worker=FakeWorker.instances[0];
    worker.reply({id:999,type:'status',status:'progress'});
    await Promise.resolve();
    expect(settled).toBe(false);
    worker.reply({id:worker.messages[0].id,type:'result',text:'coffee with milk'});
    await expect(promise).resolves.toBe('coffee with milk');
  });

  it('rejects model errors instead of inventing a recognition',async()=>{
    const {recognizeFoodImage}=await import('./localAi');
    const promise=recognizeFoodImage(new Blob(['bad']));
    const worker=FakeWorker.instances[0];
    worker.reply({id:worker.messages[0].id,type:'error',message:'model unavailable'});
    await expect(promise).rejects.toThrow('model unavailable');
  });

  it('rejects pending work and recreates the worker after a crash',async()=>{
    const {transcribeAudio}=await import('./localAi');
    const first=transcribeAudio(new Blob(['voice']),'ar');
    FakeWorker.instances[0].fail('WASM failed');
    await expect(first).rejects.toThrow('WASM failed');
    const second=transcribeAudio(new Blob(['voice2']),'ar');
    expect(FakeWorker.instances).toHaveLength(2);
    const worker=FakeWorker.instances[1];
    worker.reply({id:worker.messages[0].id,type:'result',text:'حريرة'});
    await expect(second).resolves.toBe('حريرة');
  });
});
