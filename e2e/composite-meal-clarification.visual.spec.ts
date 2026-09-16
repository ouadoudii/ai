import { expect, test } from '@playwright/test';

type Language = 'de' | 'ar';

async function installVoiceHarness(page:any, language:Language, transcript:string) {
  await page.addInitScript(({lang,text}:{lang:string;text:string})=>{
    localStorage.setItem('rhythm_language_v1',lang);
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;
    class FakeRecorder {
      state='inactive'; mimeType='audio/webm'; ondataavailable:any=null; onstop:any=null;
      start(){this.state='recording'}
      stop(){this.state='inactive';this.ondataavailable?.({data:new Blob(['voice'],{type:'audio/webm'})});this.onstop?.()}
    }
    ;(window as any).MediaRecorder=FakeRecorder;
    Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>({getTracks:()=>[{stop(){}}]})}});
    class FakeAudioContext { async decodeAudioData(){return {numberOfChannels:1,length:3200,sampleRate:16000,getChannelData:()=>new Float32Array(3200).fill(.2)}} async close(){} }
    ;(window as any).AudioContext=FakeAudioContext;
    class FakeWorker { onmessage:any=null; postMessage(message:any){if(message.type==='audio')setTimeout(()=>this.onmessage?.({data:{id:message.id,type:'result',text}}),5)} terminate(){} }
    ;(window as any).Worker=FakeWorker;
  },{lang:language,text:transcript});
}

async function record(page:any, language:Language) {
  await page.goto('/');
  const mobileCapture=page.getByTestId('primary-capture-button');
  if(await mobileCapture.isVisible()) await mobileCapture.click();
  else await page.getByRole('button',{name:language==='de'?'Moment hinzufügen':'سجّل لحظة',exact:true}).click();
  await page.getByRole('dialog').getByRole('button',{name:language==='de'?'Erzähl mir':'احكِ لي'}).click();
  await page.getByRole('button',{name:language==='de'?'Aufnahme starten':'ابدأ التسجيل'}).click();
  await page.getByRole('button',{name:language==='de'?'Aufnahme stoppen':'إيقاف التسجيل'}).click();
}

async function mockCompositeMeal(page:any, result:{items:string[];title:string;category:string;question:string}) {
  await page.route('**/api/voice-checkin',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
    coachFeedback:{title:'Verstanden',message:'Erkannt',type:'praise',badge:'Voice',habitScore:90},
    extractedData:{mealDetected:true,mealItems:result.items,mealTitle:result.title,mealCategory:result.category,mealContext:'',clarificationQuestion:result.question,
      meals:[{category:result.category,timeOfDay:'midday',time:'',mealTitle:result.title,mealItems:result.items,hungerBefore:0,fullnessAfter:0}],sleepHours:0,sleepQuality:0,wakeFeeling:'',wellbeingEntries:[]},
  })}));
}

test('mobile German flow asks only the missing Döner details and keeps stated components',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  const transcript='Döner mit Hähnchen und Knoblauchsauce';
  await mockCompositeMeal(page,{items:['Döner','Hähnchen','Knoblauchsauce'],title:transcript,category:'lunch',question:'War er im Brot oder als Teller, und wie groß war die Portion?'});
  await installVoiceHarness(page,'de',transcript);
  await record(page,'de');

  const card=page.getByTestId('meal-clarification-card');
  await expect(card).toContainText('War er im Brot oder als Teller, und wie groß war die Portion?');
  await expect(card).not.toContainText('Hähnchen?');
  await expect(page.getByText('Hähnchen',{exact:true})).toBeVisible();
  await expect(page.getByText('Knoblauchsauce',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('nimmapp_moments_v1')||'[]').some((m:any)=>m.title.includes('Döner')))).toBe(false);
  await page.getByTestId('meal-clarification-answer').fill('im Brot, große Portion');
  await page.getByRole('button',{name:'Antwort hinzufügen'}).click();
  await expect(card).toContainText('Ergänzung übernommen');
  await expect(page.getByTestId('meal-clarification-answer')).toHaveCount(0);
  await expect(page.getByText('im Brot, große Portion',{exact:true})).toBeVisible();
  await page.screenshot({path:'test-results/composite-meal-mobile-de.png',fullPage:true});
  await page.getByRole('button',{name:'Mahlzeit speichern'}).click();
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('nimmapp_moments_v1')||'[]').some((m:any)=>m.title.includes('im Brot, große Portion')))).toBe(true);
});

test('desktop mixed Arabic/French flow keeps known bowl details and asks one concise question',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  const transcript='klt bowl djaj avec riz و tahini';
  const question='شنو كان حجم الـ portion، وكان شي extras مهمين؟';
  await mockCompositeMeal(page,{items:['bowl','دجاج','riz','tahini'],title:'bowl بالدجاج وriz وtahini',category:'lunch',question});
  await installVoiceHarness(page,'ar',transcript);
  await record(page,'ar');

  const card=page.getByTestId('meal-clarification-card');
  await expect(card).toContainText(question);
  await expect(card).not.toContainText('دجاج؟');
  await expect(page.getByText('tahini',{exact:true})).toBeVisible();
  await page.getByTestId('meal-clarification-answer').fill('portion صغيرة، بلا extras');
  await page.getByRole('button',{name:'إضافة الجواب'}).click();
  await expect(card).toContainText('تمت إضافة التفصيل');
  await expect(page.getByTestId('meal-clarification-answer')).toHaveCount(0);
  await expect(page.getByText('portion صغيرة، بلا extras',{exact:true})).toBeVisible();
  await page.screenshot({path:'test-results/composite-meal-desktop-ar.png',fullPage:true});
  await page.getByRole('button',{name:'حفظ الوجبة'}).click();
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('nimmapp_moments_v1')||'[]').some((m:any)=>m.title.includes('portion صغيرة')))).toBe(true);
});
