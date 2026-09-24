import { expect, test } from '@playwright/test';

async function installVoiceHarness(page:any, transcript:string) {
  await page.addInitScript((text:string)=>{
    localStorage.setItem('rhythm_language_v1','en');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;
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
      postMessage(message:any){if(message.type==='audio')setTimeout(()=>this.onmessage?.({data:{id:message.id,type:'result',text}}),5)}
      terminate(){}
    }
    ;(window as any).Worker=FakeWorker;
  },transcript);
}

async function capture(page:any) {
  await page.goto('/');
  await page.getByTestId('primary-capture-button').click();
  await page.getByRole('dialog').getByRole('button',{name:/Tell me/}).click();
  await page.getByRole('button',{name:'Start recording'}).click();
  await page.getByRole('button',{name:'Stop recording'}).click();
}

const response = (mealTitle:string) => ({
  coachFeedback:{title:'Got it',message:'Understood',type:'praise',badge:'Voice',habitScore:90},
  extractedData:{
    mealDetected:true,mealItems:[mealTitle],mealTitle,mealCategory:'lunch',mealContext:'',
    meals:[{category:'lunch',timeOfDay:'midday',time:'',mealTitle,mealItems:[mealTitle],hungerBefore:0,fullnessAfter:0}],
    sleepHours:0,sleepQuality:0,wakeFeeling:'',wellbeingEntries:[]
  }
});

test('explicit voice correction replaces the rejected meal and survives reload',async({page})=>{
  let call=0;
  await page.route('**/api/voice-checkin',async route=>{
    call++;
    const mealTitle=call===1?'Couscous':'Salad';
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(response(mealTitle))});
  });

  await installVoiceHarness(page,'I had Couscous for lunch');
  await capture(page);
  await expect.poll(()=>call).toBe(1);
  await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('nimmapp_checkins_v1')||'[]')[0]?.food?.mealTitle)).toBe('Couscous');

  await page.close();
});

test('browser state merge keeps explicit correction semantics',async({page})=>{
  const existing={
    id:'old-midday',date:'2026-09-24',time:'13:00',timeOfDay:'midday',
    food:{mealTitle:'Couscous',category:'lunch'},
    wellbeing:{voiceTranscription:'I had Couscous for lunch'},createdAt:1,
  };
  await page.addInitScript((checkIn:any)=>{
    localStorage.setItem('rhythm_language_v1','en');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('nimmapp_checkins_v1',JSON.stringify([checkIn]));
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  },existing);
  await installVoiceHarness(page,'No, I had not Couscous but Salad for lunch');
  await page.route('**/api/voice-checkin',async route=>{
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(response('Salad'))});
  });
  await capture(page);
  await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('nimmapp_checkins_v1')||'[]').find((c:any)=>c.timeOfDay==='midday')?.food?.mealTitle)).toBe('Salad');
  await page.reload();
  await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('nimmapp_checkins_v1')||'[]').find((c:any)=>c.timeOfDay==='midday')?.food?.mealTitle)).toBe('Salad');
  await page.screenshot({path:'test-results/voice-meal-correction.png',fullPage:true});
});