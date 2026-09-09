import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';

const FOOD_LABELS=[
  'boiled eggs','fried eggs','omelette','eggs with tomato','chicken tagine','beef tagine with prunes',
  'vegetable couscous','meat couscous','harira soup','msemen flatbread','baghrir pancakes','rfissa',
  'pastilla','bissara soup','zaalouk','taktouka','grilled sardines','kefta','bread with olive oil',
  'mint tea','coffee with milk','salad','pasta','rice dish','sandwich','pizza','fruit','yogurt','dessert'
];
let classifier=null;
let transcriber=null;

async function loadPipeline(task,model){
  const device=self.navigator?.gpu?'webgpu':'wasm';
  try{return await pipeline(task,model,{device,dtype:'q8',progress_callback:p=>self.postMessage({type:'status',status:p?.status||'loading',file:p?.file||''})})}
  catch(err){
    if(device==='wasm')throw err;
    return await pipeline(task,model,{device:'wasm',dtype:'q8',progress_callback:p=>self.postMessage({type:'status',status:p?.status||'loading',file:p?.file||''})});
  }
}

self.onmessage=async(event)=>{
  const {id,type,blob,audio,language}=event.data||{};
  try{
    if(type==='image'){
      classifier ||= await loadPipeline('zero-shot-image-classification','Xenova/clip-vit-base-patch32');
      const url=URL.createObjectURL(blob);
      try{
        const output=await classifier(url,FOOD_LABELS);
        const results=(Array.isArray(output)?output:[]).slice(0,4).map(x=>({label:String(x.label),score:Number(x.score)||0}));
        self.postMessage({id,type:'result',results});
      } finally { URL.revokeObjectURL(url); }
      return;
    }
    if(type==='audio'){
      if(!(audio instanceof Float32Array)||audio.length===0)throw new Error('Invalid decoded audio');
      transcriber ||= await loadPipeline('automatic-speech-recognition','onnx-community/whisper-tiny');
      const options={task:'transcribe',chunk_length_s:20,stride_length_s:4};
      if(language==='ar')options.language='ar';
      const output=await transcriber(audio,options);
      self.postMessage({id,type:'result',text:String(output?.text||'').trim()});
      return;
    }
    throw new Error('Unsupported local AI task');
  }catch(error){
    self.postMessage({id,type:'error',message:error instanceof Error?error.message:'Local AI failed'});
  }
};