import { expect, test } from '@playwright/test';

async function seedProfile(page:any,language:'ar'|'de'='ar',checkIns:any[]=[],moments:any[]=[]){
  await page.addInitScript(({language,checkIns,moments}:{language:string;checkIns:any[];moments:any[]})=>{
    localStorage.setItem('rhythm_language_v1',language);
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('rhythm_voice_entry_seen_v1','true');
    localStorage.setItem('nimmapp_moments_v1',JSON.stringify(moments));
    localStorage.setItem('nimmapp_checkins_v1',JSON.stringify(checkIns));
    localStorage.setItem('rhythm_intro_profile_v1',JSON.stringify({
      summary:'بغيت نفهم نهاري مزيان.',priorities:['الطاقة'],preferences:['الصوت'],rawIntro:'كنفضل نهضر.',confirmedAt:Date.now(),
      firstPlan:{title:'راقب نهارك',rationale:'نفهمو الإيقاع ديالك.',focusAreas:['الطاقة'],firstStep:'سجل شنو وقع اليوم.',phase:'midday'}
    }));
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  },{language,checkIns,moments});
}

async function installArabicVoiceHarness(page:any,transcript:string){
  await page.addInitScript((text:string)=>{
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
    class FakeAudioContext{async decodeAudioData(){return {numberOfChannels:1,length:3200,sampleRate:16000,getChannelData:()=>new Float32Array(3200).fill(.2)}}async close(){}}
    ;(window as any).AudioContext=FakeAudioContext;
    class FakeWorker{onmessage:any=null;postMessage(message:any){if(message.type==='audio')setTimeout(()=>this.onmessage?.({data:{id:message.id,type:'result',text}}),5)}terminate(){}}
    ;(window as any).Worker=FakeWorker;
  },transcript);
}

test('voice is the primary home action on mobile and opens recording directly',async({page},testInfo)=>{
  await page.clock.setFixedTime(new Date('2026-09-18T13:00:00'));
  await page.setViewportSize({width:390,height:844});
  await seedProfile(page,'de');
  await page.goto('/');
  const voice=page.getByTestId('voice-home-mic');
  await expect(voice).toBeVisible();
  await expect(voice).toHaveAttribute('data-full-day-recap','false');
  await expect(voice).toContainText('Sprich mit Moment');
  await page.screenshot({path:testInfo.outputPath('voice-first-home-mobile.png'),fullPage:true});
  await voice.click();
  await expect(page.getByRole('button',{name:'Aufnahme starten'})).toBeVisible();
});

test('after 18:00 an incomplete day collapses to one Darija whole-day voice recap',async({page},testInfo)=>{
  await page.clock.setFixedTime(new Date('2026-09-18T20:00:00'));
  await page.setViewportSize({width:1280,height:900});
  await seedProfile(page,'ar');
  await page.goto('/');
  const voice=page.getByTestId('voice-home-mic');
  await expect(voice).toHaveAttribute('data-full-day-recap','true');
  await expect(voice).toContainText('عاود ليا نهارك كامل');
  await expect(page.getByText('صباح الخير',{exact:true})).toHaveCount(0);
  await expect(page.getByText('منتصف اليوم',{exact:true})).toHaveCount(0);
  await expect(page.getByText('وجبة خفيفة',{exact:true})).toHaveCount(0);
  await expect(page.getByTestId('personal-plan-home-card')).toHaveCount(0);
  await page.screenshot({path:testInfo.outputPath('whole-day-recap-arabic-desktop.png'),fullPage:true});
});

test('whole-day voice recap preserves earlier lunch speech and does not duplicate the lunch meal',async({page})=>{
  await page.clock.setFixedTime(new Date('2026-09-18T20:00:00'));
  const oldTranscript='فالغدا كليت كسكس بالخضرة وكنت جوعان';
  const recapTranscript='الصباح فطرت بيض. فالغدا كليت كسكس بالخضرة. فالعشا كليت حريرة.';
  const existingMoment={id:'existing-lunch',title:'كسكس بالخضرة',label:'الغداء',category:'lunch',date:'2026-09-18',time:'13:15',location:'الدار',locationCategory:'home',imageUrl:'',rating:5,mood:'satisfied',notes:oldTranscript,tags:['Voice','midday'],createdAt:1};
  const existingCheck={id:'existing-midday',date:'2026-09-18',time:'13:15',timeOfDay:'midday',food:{mealTitle:'كسكس بالخضرة',category:'lunch'},wellbeing:{voiceTranscription:oldTranscript},createdAt:1};
  await seedProfile(page,'ar',[existingCheck],[existingMoment]);
  await installArabicVoiceHarness(page,recapTranscript);
  await page.route('**/api/voice-checkin',async route=>{
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
      coachFeedback:{title:'تمام',message:'تسجل نهارك',type:'praise',badge:'Voice',habitScore:90},
      extractedData:{
        mealDetected:true,mealTitle:'بيض',mealItems:['بيض'],mealCategory:'breakfast',mealContext:'',
        meals:[
          {category:'breakfast',timeOfDay:'morning',time:'08:00',mealTitle:'بيض',mealItems:['بيض'],hungerBefore:0,fullnessAfter:0},
          {category:'lunch',timeOfDay:'midday',time:'',mealTitle:'كسكس بالخضرة',mealItems:['كسكس بالخضرة'],hungerBefore:0,fullnessAfter:0},
          {category:'dinner',timeOfDay:'evening',time:'20:00',mealTitle:'حريرة',mealItems:['حريرة'],hungerBefore:0,fullnessAfter:0}
        ],
        sleepHours:0,sleepQuality:0,wakeFeeling:'',wellbeingEntries:[]
      }
    })});
  });
  await page.goto('/');
  await page.getByTestId('voice-home-mic').click();
  await page.getByRole('button',{name:/ابدأ التسجيل/}).click();
  await page.getByRole('button',{name:/إيقاف التسجيل/}).click();
  await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('nimmapp_moments_v1')||'[]').filter((m:any)=>m.category==='lunch'&&m.title==='كسكس بالخضرة').length)).toBe(1);
  const saved=await page.evaluate(()=>({moments:JSON.parse(localStorage.getItem('nimmapp_moments_v1')||'[]'),checks:JSON.parse(localStorage.getItem('nimmapp_checkins_v1')||'[]')}));
  const lunch=saved.checks.find((c:any)=>c.id==='existing-midday');
  expect(lunch.wellbeing.voiceTranscription).toContain(oldTranscript);
  expect(lunch.wellbeing.voiceTranscription).toContain(recapTranscript);
  expect(saved.moments.some((m:any)=>m.category==='dinner'&&m.title==='حريرة')).toBe(true);
});
