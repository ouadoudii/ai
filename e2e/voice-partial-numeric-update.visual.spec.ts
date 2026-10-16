import { devices, expect, test, type Browser, type Page } from '@playwright/test';

async function installHarness(page: Page, transcript: string) {
  await page.addInitScript((text: string) => {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    localStorage.setItem('rhythm_language_v1','en');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('rhythm_intro_profile_v1',JSON.stringify({
      summary:'Track my rhythm.',priorities:[],preferences:[],rawIntro:'Track my rhythm.',confirmedAt:1,
      firstPlan:{title:'Observe',rationale:'Notice patterns.',focusAreas:[],firstStep:'Capture the next check-in.',phase:'morning'},
    }));
    localStorage.setItem('nimmapp_checkins_v1',JSON.stringify([{
      id:'existing-morning',date,time:'08:00',timeOfDay:'morning',
      sleep:{durationHours:7.5,quality:4,wakeCount:0},
      wellbeing:{energyLevel:2,stressLevel:4,waterGlasses:1,voiceTranscription:'I slept 7.5 hours. Energy 2, stress 4, water 1.'},createdAt:1,
    }]));
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
    delete (window as any).SpeechRecognition; delete (window as any).webkitSpeechRecognition;
    class FakeRecorder { static isTypeSupported(){return true} state='inactive';mimeType='audio/webm';ondataavailable:any=null;onstop:any=null;start(){this.state='recording'}stop(){this.state='inactive';this.ondataavailable?.({data:new Blob(['voice'],{type:'audio/webm'})});this.onstop?.()} }
    ;(window as any).MediaRecorder=FakeRecorder;
    Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>({getTracks:()=>[{stop(){}}]})}});
    class FakeAudioContext { async decodeAudioData(){return {numberOfChannels:1,length:3200,sampleRate:16000,getChannelData:()=>new Float32Array(3200).fill(.2)}} async close(){} }
    ;(window as any).AudioContext=FakeAudioContext;
    class FakeWorker { onmessage:any=null;postMessage(message:any){if(message.type==='audio')setTimeout(()=>this.onmessage?.({data:{id:message.id,type:'result',text}}),5)}terminate(){} }
    ;(window as any).Worker=FakeWorker;
  },transcript);
}

async function exercise(browser: Browser, mobile: boolean) {
  const context = await browser.newContext(mobile ? devices['Pixel 7'] : {viewport:{width:1280,height:900}});
  const page = await context.newPage();
  const transcript = 'Actually I woke up twice; otherwise keep what I told you.';
  await installHarness(page,transcript);
  await page.route('**/api/voice-checkin',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
    coachFeedback:{title:'Saved',message:'Updated',type:'praise',badge:'Voice',habitScore:90},
    extractedData:{meals:[],sleepHours:6,sleepQuality:1,wakeFeeling:'exhausted',wakeCount:2,awakeMinutes:30,sleepExplicitFields:['wakeCount'],wellbeingEntries:[{timeOfDay:'morning',energyLevel:5,mood:'comfort',stressLevel:1,waterGlasses:8,note:'',explicitFields:[]}]},
  })}));
  await page.goto('/');
  await page.getByTestId(mobile?'primary-capture-button':'desktop-capture-button').click();
  await page.locator('[data-capture-method="voice"]').click();
  await page.getByRole('button',{name:'Start recording'}).click();
  await page.getByRole('button',{name:'Stop recording'}).click();
  await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('nimmapp_checkins_v1')||'[]')[0])).toMatchObject({
    sleep:{durationHours:7.5,quality:4,wakeCount:2},wellbeing:{energyLevel:2,stressLevel:4,waterGlasses:1},
  });
  await page.reload();
  const stored = await page.evaluate(()=>JSON.parse(localStorage.getItem('nimmapp_checkins_v1')||'[]')[0]);
  expect(stored.sleep).toEqual({durationHours:7.5,quality:4,wakeCount:2});
  expect(stored.wellbeing).toMatchObject({energyLevel:2,stressLevel:4,waterGlasses:1});
  await page.screenshot({path:`test-results/voice-partial-numeric-${mobile?'mobile':'desktop'}.png`,fullPage:true});
  await context.close();
}

test('#163 partial Voice update preserves prior numeric facts on desktop and mobile',async({browser})=>{
  await exercise(browser,false);
  await exercise(browser,true);
});
