import { expect, test } from '@playwright/test';

async function installVoiceHarness(page:any, language:'ar'|'en', transcript:string) {
  await page.addInitScript(({lang,text}:{lang:string;text:string})=>{
    localStorage.setItem('rhythm_language_v1',lang);
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
    if(lang==='ar'){
      class BadChromeSpeech{start(){throw new Error('Arabic must use Whisper')} stop(){}}
      ;(window as any).webkitSpeechRecognition=BadChromeSpeech;
    } else {
      delete (window as any).SpeechRecognition;delete (window as any).webkitSpeechRecognition;
    }
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

async function record(page:any, language:'ar'|'en') {
  await page.goto('/');
  await page.getByTestId('primary-capture-button').click();
  await page.getByRole('dialog').getByRole('button',{name:language==='ar'?/احكِ لي/:/Tell me/}).click();
  await page.getByRole('button',{name:language==='ar'?/ابدأ التسجيل/:'Start recording'}).click();
  await page.getByRole('button',{name:language==='ar'?/إيقاف التسجيل/:'Stop recording'}).click();
}

async function stored(page:any,key:string){
  return page.evaluate((storageKey:string)=>JSON.parse(localStorage.getItem(storageKey)||'[]'),key);
}

test('Voice capture stores a recognized meal instead of requiring a second editor step',async({page})=>{
  const transcript='boiled eggs';
  let calls=0;
  await page.route('**/api/voice-checkin',async route=>{
    calls++;
    const body=JSON.parse(route.request().postData()||'{}');
    expect(body.transcript).toBe(transcript);
    expect(body.language).toBe('en');
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
      coachFeedback:{title:'Got it',message:'Understood',type:'praise',badge:'Voice',habitScore:90},
      extractedData:{
        mealDetected:true,mealItems:['boiled eggs'],mealTitle:'boiled eggs',mealCategory:'breakfast',mealContext:'',
        meals:[{category:'breakfast',timeOfDay:'morning',time:'',mealTitle:'boiled eggs',mealItems:['boiled eggs'],hungerBefore:0,fullnessAfter:0}],
        sleepHours:0,sleepQuality:0,wakeFeeling:'',wellbeingEntries:[]
      }
    })});
  });
  await installVoiceHarness(page,'en',transcript);
  await record(page,'en');
  await expect.poll(()=>calls).toBe(1);
  await expect.poll(async()=>((await stored(page,'nimmapp_moments_v1')) as any[]).some(m=>m.title==='boiled eggs'&&m.category==='breakfast')).toBe(true);
  await expect(page.getByRole('heading',{name:'What did you have?'})).toHaveCount(0);
});

test('Arabic free voice keeps negation out and assigns distinct meal moments',async({page})=>{
  const transcript='كليت جوج بيضات مسلوقين مع الخبز ومن بعد شربت قهوة بالحليب وما كليتش الحلو';
  let received='';
  await page.route('**/api/voice-checkin',async route=>{
    const body=JSON.parse(route.request().postData()||'{}');received=body.transcript||'';
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
      coachFeedback:{title:'تمام',message:'تم فهم الرسالة كاملة',type:'praise',badge:'Voice',habitScore:90},
      extractedData:{
        mealDetected:true,mealItems:['بيض مسلوق','خبز'],mealTitle:'بيض مسلوق وخبز',mealCategory:'breakfast',mealContext:'',
        meals:[
          {category:'breakfast',timeOfDay:'morning',time:'',mealTitle:'بيض مسلوق وخبز',mealItems:['بيض مسلوق','خبز'],hungerBefore:0,fullnessAfter:0},
          {category:'coffee',timeOfDay:'morning',time:'',mealTitle:'قهوة بالحليب',mealItems:['قهوة بالحليب'],hungerBefore:0,fullnessAfter:0}
        ],
        sleepHours:0,sleepQuality:0,wakeFeeling:'',wellbeingEntries:[]
      }
    })});
  });
  await installVoiceHarness(page,'ar',transcript);
  await record(page,'ar');
  await expect.poll(()=>received).toBe(transcript);
  await expect.poll(async()=>{
    const moments=await stored(page,'nimmapp_moments_v1') as any[];
    return moments.filter(m=>String(m.id).startsWith('voice-moment-')).map(m=>m.title).sort().join('|');
  }).toContain('بيض مسلوق وخبز');
  const moments=await stored(page,'nimmapp_moments_v1') as any[];
  const voice=JSON.stringify(moments.filter(m=>String(m.id).startsWith('voice-moment-')));
  expect(voice).toContain('قهوة بالحليب');
  expect(voice).not.toContain('الحلو');
});

test('Arabic Whisper sends one complete message and stores all items from it',async({page})=>{
  const transcript='الصباح كليت المسمن مع العسل ومن بعد شربت أتاي';
  let calls=0;
  await page.route('**/api/voice-checkin',async route=>{
    calls++;
    const body=JSON.parse(route.request().postData()||'{}');expect(body.transcript).toBe(transcript);
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
      coachFeedback:{title:'تمام',message:'فهمت',type:'praise',badge:'Voice',habitScore:90},
      extractedData:{mealDetected:true,mealItems:['مسمن بالعسل','أتاي'],mealTitle:'مسمن بالعسل وأتاي',mealCategory:'breakfast',mealContext:'',
        meals:[{category:'breakfast',timeOfDay:'morning',time:'',mealTitle:'مسمن بالعسل وأتاي',mealItems:['مسمن بالعسل','أتاي'],hungerBefore:0,fullnessAfter:0}],
        sleepHours:0,sleepQuality:0,wakeFeeling:'',wellbeingEntries:[]}
    })});
  });
  await installVoiceHarness(page,'ar',transcript);
  await record(page,'ar');
  await expect.poll(()=>calls).toBe(1);
  await expect.poll(async()=>JSON.stringify((await stored(page,'nimmapp_moments_v1') as any[]).filter(m=>String(m.id).startsWith('voice-moment-')))).toContain('مسمن بالعسل');
  const voice=JSON.stringify((await stored(page,'nimmapp_moments_v1') as any[]).filter(m=>String(m.id).startsWith('voice-moment-')));
  expect(voice).toContain('أتاي');
});

test('One free Darija day report creates meals, sleep and energy entries at their correct times',async({page})=>{
  const transcript='نعست سبع ساعات ونص وفقت عيان شوية. فالفطور كليت جوج بيضات مسلوقين وخبز. من بعد كليت كرواسون. فالغدا كليت كسكس بالخضرة وكنت جوعان بزاف. ومن بعد الغدا حسيت بالطاقة مزيانة.';
  await page.route('**/api/voice-checkin',async route=>{
    const body=JSON.parse(route.request().postData()||'{}');expect(body.transcript).toBe(transcript);
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
      coachFeedback:{title:'تمام',message:'وزعت المعلومات على اليوم',type:'praise',badge:'Voice',habitScore:90},
      extractedData:{
        mealDetected:true,mealTitle:'بيض مسلوق وخبز',mealItems:['جوج بيضات مسلوقين','خبز'],mealCategory:'breakfast',mealContext:'',
        meals:[
          {category:'breakfast',timeOfDay:'morning',time:'',mealTitle:'بيض مسلوق وخبز',mealItems:['جوج بيضات مسلوقين','خبز'],hungerBefore:0,fullnessAfter:0},
          {category:'snack',timeOfDay:'morning',time:'',mealTitle:'كرواسون',mealItems:['كرواسون'],hungerBefore:0,fullnessAfter:0},
          {category:'lunch',timeOfDay:'midday',time:'',mealTitle:'كسكس بالخضرة',mealItems:['كسكس بالخضرة'],hungerBefore:4,fullnessAfter:0}
        ],
        sleepHours:7.5,sleepQuality:0,wakeFeeling:'tired',
        wellbeingEntries:[
          {timeOfDay:'morning',energyLevel:2,mood:'',stressLevel:0,waterGlasses:0,note:'فقت عيان شوية'},
          {timeOfDay:'midday',energyLevel:4,mood:'energized',stressLevel:0,waterGlasses:0,note:'من بعد الغدا حسيت بالطاقة مزيانة'}
        ]
      }
    })});
  });
  await installVoiceHarness(page,'ar',transcript);
  await record(page,'ar');
  await expect.poll(async()=>((await stored(page,'nimmapp_moments_v1')) as any[]).filter(m=>String(m.id).startsWith('voice-moment-')).length).toBe(3);
  const moments=(await stored(page,'nimmapp_moments_v1') as any[]).filter(m=>String(m.id).startsWith('voice-moment-'));
  expect(moments.map(m=>m.category).sort()).toEqual(['breakfast','lunch','snack']);
  expect(moments.find(m=>m.category==='lunch')?.hungerLevel).toBe(4);
  const checks=(await stored(page,'nimmapp_checkins_v1') as any[]).filter(c=>String(c.id).startsWith('voice-checkin-'));
  expect(checks.find(c=>c.timeOfDay==='morning')?.sleep).toMatchObject({durationHours:7.5,wakeFeeling:'tired'});
  expect(checks.find(c=>c.timeOfDay==='morning')?.wellbeing.energyLevel).toBe(2);
  expect(checks.find(c=>c.timeOfDay==='midday')?.wellbeing.energyLevel).toBe(4);
  expect(checks.find(c=>c.timeOfDay==='morning')?.wellbeing).not.toHaveProperty('stressLevel');
});
