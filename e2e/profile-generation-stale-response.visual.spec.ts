import { expect, test } from '@playwright/test';

async function installSpeech(page:any,transcript:string){
  await page.addInitScript((text:string)=>{
    localStorage.setItem('rhythm_language_v1','de');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('nimmapp_moments_v1','[]');
    localStorage.setItem('nimmapp_checkins_v1','[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
    class FakeSpeechRecognition{
      lang='';interimResults=false;continuous=false;onresult:any=null;onend:any=null;onerror:any=null;
      start(){}
      stop(){const result:any=[{transcript:text}];result.isFinal=true;this.onresult?.({resultIndex:0,results:[result]});this.onend?.()}
    }
    ;(window as any).SpeechRecognition=FakeSpeechRecognition;
    ;(window as any).webkitSpeechRecognition=FakeSpeechRecognition;
    class FakeRecorder{
      static isTypeSupported(){return true}
      state='inactive';mimeType='audio/webm';ondataavailable:any=null;onstop:any=null;
      start(){this.state='recording'}
      stop(){this.state='inactive';this.ondataavailable?.({data:new Blob(['voice'],{type:'audio/webm'})});this.onstop?.()}
    }
    ;(window as any).MediaRecorder=FakeRecorder;
    Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>({getTracks:()=>[{stop(){}}]})}});
    class FakeAudioContext{async decodeAudioData(){return {numberOfChannels:1,length:3200,sampleRate:16000,getChannelData:()=>new Float32Array(3200).fill(.2)}}async close(){}}
    ;(window as any).AudioContext=FakeAudioContext;
    class FakeWorker{onmessage:any=null;postMessage(message:any){if(message.type==='audio')setTimeout(()=>this.onmessage?.({data:{id:message.id,type:'result',text}}),5)}terminate(){}}
    ;(window as any).Worker=FakeWorker;
  },transcript);
}

async function speak(page:any){
  await page.goto('/');
  await page.getByTestId('primary-capture-button').click();
  await page.getByRole('dialog').locator('[data-capture-method="voice"]').click();
  await page.getByRole('button',{name:'Aufnahme starten'}).click();
  await page.getByRole('button',{name:'Aufnahme stoppen'}).click();
}

const emptyVoiceResult={coachFeedback:{title:'Verstanden',message:'Danke',type:'praise',badge:'Voice',habitScore:90},extractedData:{mealDetected:false,mealItems:[],mealTitle:'',mealCategory:'',mealContext:'',meals:[],sleepHours:0,sleepQuality:0,wakeFeeling:'',wellbeingEntries:[]}};

test('closing profile invalidates a late profile-generation response',async({page})=>{
  const transcript='Ich möchte meinen Essrhythmus besser verstehen.';
  await installSpeech(page,transcript);
  await page.route('**/api/voice-checkin',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(emptyVoiceResult)}));
  await page.route('**/api/voice-intent',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({intent:'profile_goal',confidence:.99})}));
  let release!:()=>void;
  const pending=new Promise<void>(resolve=>{release=resolve});
  await page.route('**/api/coach-chat',async route=>{
    await pending;
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reply:JSON.stringify({summary:'STALE PROFILE',priorities:['stale'],preferences:[],firstPlan:{title:'stale',rationale:'stale',focusAreas:['stale'],firstStep:'stale',phase:'midday'}})})});
  });
  await speak(page);
  const modal=page.getByTestId('profile-intro-modal');
  await expect(modal).toBeVisible();
  await expect(modal.getByText('Ich fasse das für dich zusammen …')).toBeVisible();
  await modal.getByRole('button',{name:'Zurück'}).click();
  await expect(modal).toHaveCount(0);
  release();
  await page.waitForTimeout(100);
  await expect(page.getByText('STALE PROFILE')).toHaveCount(0);
});
