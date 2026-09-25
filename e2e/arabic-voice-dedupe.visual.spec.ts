import { expect, test } from '@playwright/test';

async function installArabicVoiceHarness(page:any, transcript:string, delayMs=5) {
  await page.addInitScript(({text,delay}:{text:string;delay:number})=>{
    localStorage.setItem('rhythm_language_v1','ar');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
    class BadChromeSpeech{start(){throw new Error('Arabic must use Whisper')} stop(){}}
    ;(window as any).webkitSpeechRecognition=BadChromeSpeech;
    class FakeRecorder{
      static isTypeSupported(){return true}
      state='inactive';mimeType='audio/webm';ondataavailable:any=null;onstop:any=null;
      constructor(_stream:any){}
      start(){this.state='recording'}
      stop(){this.state='inactive';this.ondataavailable?.({data:new Blob(['voice'],{type:'audio/webm'})});this.onstop?.()}
    }
    ;(window as any).MediaRecorder=FakeRecorder;
    Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>({getTracks:()=>[{stop(){}}]})}});
    class FakeAudioContext{
      async decodeAudioData(){return {numberOfChannels:1,length:3200,sampleRate:16000,getChannelData:()=>new Float32Array(3200).fill(.2)}}
      async close(){}
    }
    ;(window as any).AudioContext=FakeAudioContext;
    class FakeWorker{
      onmessage:any=null;
      postMessage(message:any){if(message.type==='audio')setTimeout(()=>this.onmessage?.({data:{id:message.id,type:'result',text}}),delay)}
      terminate(){}
    }
    ;(window as any).Worker=FakeWorker;
  }, {text:transcript,delay:delayMs});
}

test('Arabic voice capture stores one meal when extraction returns spelling variants of the same dish',async({page})=>{
  const transcript='فطرت أومليت بالجبنة';
  await page.route('**/api/voice-checkin',async route=>{
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
      coachFeedback:{title:'تمام',message:'فهمت',type:'praise',badge:'Voice',habitScore:90},
      extractedData:{
        mealDetected:true,mealItems:['أُومليت بالجبنة'],mealTitle:'أُومليت بالجبنة',mealCategory:'breakfast',mealContext:'',
        meals:[
          {category:'breakfast',timeOfDay:'morning',time:'08:15',mealTitle:'أُومليت بالجبنة',mealItems:['أُومليت بالجبنة'],hungerBefore:3,fullnessAfter:4},
          {category:'breakfast',timeOfDay:'morning',time:'08:15',mealTitle:'اومليت بالجبنه',mealItems:['اومليت بالجبنه'],hungerBefore:3,fullnessAfter:4}
        ],
        sleepHours:0,sleepQuality:0,wakeFeeling:'',wellbeingEntries:[]
      }
    })});
  });
  await installArabicVoiceHarness(page,transcript);
  await page.goto('/');
  await page.getByTestId('primary-capture-button').click();
  await page.getByRole('dialog').getByRole('button',{name:/احكِ لي/}).click();
  await page.getByRole('button',{name:/ابدأ التسجيل/}).click();
  await page.getByRole('button',{name:/إيقاف التسجيل/}).click();

  await expect.poll(async()=>page.evaluate(()=>{
    const moments=JSON.parse(localStorage.getItem('nimmapp_moments_v1')||'[]') as any[];
    return moments.filter(m=>String(m.id).startsWith('voice-moment-')).length;
  })).toBe(1);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('nimmapp_moments_v1')||'[]') as any[]);
  const voice=saved.filter(m=>String(m.id).startsWith('voice-moment-'));
  expect(voice[0]).toMatchObject({category:'breakfast',title:'أُومليت بالجبنة',time:'08:15'});
});

test('closing Arabic voice while Whisper is pending ignores the abandoned transcript',async({page})=>{
  let voiceCheckInRequests=0;
  await page.route('**/api/voice-checkin',async route=>{
    voiceCheckInRequests++;
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({coachFeedback:{title:'',message:'',type:'neutral',badge:'',habitScore:0},extractedData:{mealDetected:false,mealItems:[],mealTitle:'',mealCategory:'',mealContext:'',meals:[],sleepHours:0,sleepQuality:0,wakeFeeling:'',wellbeingEntries:[]}})});
  });
  await installArabicVoiceHarness(page,'هذا التسجيل يجب تجاهله',1000);
  await page.goto('/');
  await page.getByTestId('primary-capture-button').click();
  await page.getByRole('dialog').getByRole('button',{name:/احكِ لي/}).click();
  const voiceDialog=page.getByRole('dialog');
  await voiceDialog.getByRole('button',{name:/ابدأ التسجيل/}).click();
  await voiceDialog.getByRole('button',{name:/إيقاف التسجيل/}).click();
  await voiceDialog.getByRole('button',{name:'إغلاق'}).click();
  await expect(voiceDialog).toBeHidden();
  await page.waitForTimeout(1200);
  expect(voiceCheckInRequests).toBe(0);
  const voiceMoments=await page.evaluate(()=>{
    const moments=JSON.parse(localStorage.getItem('nimmapp_moments_v1')||'[]') as any[];
    return moments.filter(m=>String(m.id).startsWith('voice-moment-')).length;
  });
  expect(voiceMoments).toBe(0);
});
