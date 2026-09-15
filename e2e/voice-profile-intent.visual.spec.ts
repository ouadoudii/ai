import { expect, test } from '@playwright/test';

type Language='de'|'ar';

async function installSpeech(page:any,language:Language,transcript:string){
  await page.addInitScript(({lang,text}:{lang:string;text:string})=>{
    localStorage.setItem('rhythm_language_v1',lang);
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('nimmapp_moments_v1','[]');
    localStorage.setItem('nimmapp_checkins_v1','[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');

    class FakeSpeechRecognition{
      lang='';interimResults=false;continuous=false;onresult:any=null;onend:any=null;onerror:any=null;
      start(){}
      stop(){
        const result:any=[{transcript:text}];result.isFinal=true;
        this.onresult?.({resultIndex:0,results:[result]});
        this.onend?.();
      }
    }
    ;(window as any).SpeechRecognition=FakeSpeechRecognition;
    ;(window as any).webkitSpeechRecognition=FakeSpeechRecognition;

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
  },{lang:language,text:transcript});
}

async function speak(page:any,language:Language){
  await page.goto('/');
  await page.getByTestId('primary-capture-button').click();
  const chooser=page.getByRole('dialog');
  await chooser.getByRole('button').last().click();
  await page.getByRole('button',{name:language==='de'?'Aufnahme starten':'ابدأ التسجيل'}).click();
  await page.getByRole('button',{name:language==='de'?'Aufnahme stoppen':'إيقاف التسجيل'}).click();
}

const emptyVoiceResult={
  coachFeedback:{title:'Verstanden',message:'Danke',type:'praise',badge:'Voice',habitScore:90},
  extractedData:{mealDetected:false,mealItems:[],mealTitle:'',mealCategory:'',mealContext:'',meals:[],sleepHours:0,sleepQuality:0,wakeFeeling:'',wellbeingEntries:[]},
};

for(const example of[
  {language:'de' as const,text:'Ich habe Übergewicht, ich möchte abnehmen.'},
  {language:'de' as const,text:'Ich will gesünder essen und endlich einen besseren Rhythmus finden.'},
  {language:'de' as const,text:'Ich habe ständig Hunger und möchte verstehen, was dahinter steckt.'},
  {language:'ar' as const,text:'بغيت ننقص فالوزن ونولي ناكل مزيان.'},
]){
  test(`${example.language} personal goal voice is routed to profile instead of meal error: ${example.text}`,async({page})=>{
    await page.route('**/api/voice-checkin',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(emptyVoiceResult)}));
    await page.route('**/api/coach-chat',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'offline in browser contract test'})}));
    let intentCalls=0;
    await page.route('**/api/voice-intent',async route=>{
      intentCalls++;
      const body=JSON.parse(route.request().postData()||'{}');
      expect(body.transcript).toBe(example.text);
      expect(body.language).toBe(example.language);
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({intent:'profile_goal',confidence:.96,reason:'lasting personal goal'})});
    });
    await installSpeech(page,example.language,example.text);
    await speak(page,example.language);
    await expect.poll(()=>intentCalls).toBe(1);
    const profile=page.getByTestId('profile-intro-modal');
    await expect(profile).toBeVisible();
    await expect(profile.getByTestId('profile-summary')).toHaveValue(example.text);
    await expect(profile.getByTestId('personal-first-plan')).toBeVisible();
    await expect(page.getByRole('heading',{name:/Was hast du gegessen\?|What did you have\?/i})).toHaveCount(0);
    await expect(page.getByTestId('voice-understanding-card')).toHaveCount(0);
  });
}

test('a real meal stays in the meal journal and never calls the profile intent classifier',async({page})=>{
  const transcript='Ich habe Vollkornbrot mit Käse gegessen.';
  let intentCalls=0;
  await page.route('**/api/voice-intent',async route=>{intentCalls++;await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({intent:'profile_goal',confidence:.99})});});
  await page.route('**/api/voice-checkin',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
    coachFeedback:{title:'Erfasst',message:'Verstanden',type:'praise',badge:'Voice',habitScore:90},
    extractedData:{mealDetected:true,mealItems:['Vollkornbrot mit Käse'],mealTitle:'Vollkornbrot mit Käse',mealCategory:'breakfast',mealContext:'',meals:[{category:'breakfast',timeOfDay:'morning',time:'',mealTitle:'Vollkornbrot mit Käse',mealItems:['Vollkornbrot mit Käse'],hungerBefore:0,fullnessAfter:0}],sleepHours:0,sleepQuality:0,wakeFeeling:'',wellbeingEntries:[]},
  })}));
  await installSpeech(page,'de',transcript);
  await speak(page,'de');
  await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('nimmapp_moments_v1')||'[]').some((m:any)=>m.title==='Vollkornbrot mit Käse'))).toBe(true);
  expect(intentCalls).toBe(0);
  await expect(page.getByTestId('profile-intro-modal')).toHaveCount(0);
});
