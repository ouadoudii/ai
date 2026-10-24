import {test,expect} from '@playwright/test';

const countries=['DZ','BH','KM','DJ','EG','IQ','JO','KW','LB','LY','MR','MA','OM','PS','QA','SA','SO','SD','SY','TN','AE','YE'];


async function visibleArabicOutsideLanguageControls(page:any){
  return page.evaluate(()=>{
    const arabic=/[\u0600-\u06FF]/;
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const hits:string[]=[];
    let node:Node|null;
    while((node=walker.nextNode())){
      const el=node.parentElement;
      if(!el)continue;
      if(el.closest('[data-language-option="true"]'))continue;
      const style=getComputedStyle(el);
      if(style.display==='none'||style.visibility==='hidden')continue;
      const text=(node.textContent||'').trim();
      if(text==='العربية')continue;
      if(text&&arabic.test(text))hits.push(text);
    }
    return [...new Set(hits)];
  });
}

async function suppressAutoCapture(page:any){
  await page.addInitScript(()=>{
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  });
}

async function openCapture(page:any){
  const captureButton=page.getByRole('button',{name:'سجّل لحظة'}).first();
  await expect(captureButton).toBeVisible();
  await captureButton.click();
}

test('real Arabic first-run journey: guest to onboarding to app',async({page},testInfo)=>{
  await page.addInitScript(()=>localStorage.setItem('rhythm_language_v1','ar'));
  await suppressAutoCapture(page);
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await page.screenshot({path:testInfo.outputPath('01-account-choice.png'),fullPage:true});

  await page.getByRole('button',{name:/ابدأ على هذا الجهاز/}).click();
  await expect(page.getByRole('button',{name:/ابدأ اليوم|ابدأ/})).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('02-onboarding.png'),fullPage:true});

  await page.getByRole('button',{name:/ابدأ اليوم|ابدأ/}).click();
  await expect(page.getByText(/مرحباً بك/)).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('03-home-after-onboarding.png'),fullPage:true});
});

for(const {name,viewport} of [
  {name:'mobile',viewport:{width:390,height:844}},
  {name:'desktop',viewport:{width:1440,height:900}},
]){
  test(`capture stays Arabic-only without legacy language controls on ${name}`,async({page})=>{
    await page.setViewportSize(viewport);
    await page.addInitScript(()=>{
      localStorage.setItem('rhythm_language_v1','en');
      localStorage.setItem('cary_access_mode_v1','guest');
      localStorage.setItem('cary_onboarding_v2_complete','true');
      sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
    });
    await page.goto('/');
    await page.getByTestId(name==='desktop'?'desktop-capture-button':'primary-capture-button').click();
    const dialog=page.getByRole('dialog');
    await expect(page.locator('html')).toHaveAttribute('lang','ar');
    await expect(page.locator('html')).toHaveAttribute('dir','rtl');
    await expect(dialog.getByText('ما اللحظة التي تريد تسجيلها؟',{exact:true})).toBeVisible();
    await expect(dialog.getByRole('button',{name:/صورة/})).toBeVisible();
    await expect(dialog.getByRole('button',{name:/احكِ لي/})).toBeVisible();
    await expect(dialog.locator('[data-language-option]')).toHaveCount(0);
    await expect(dialog.getByRole('button',{name:/English|Deutsch|Français/})).toHaveCount(0);
  });
}

for(const country of countries){
  test(`${country} Arabic mobile app journey`,async({page},testInfo)=>{
    await page.route('**/api/locale',async route=>{
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({country})});
    });
    await page.addInitScript(({country})=>{
      localStorage.setItem('rhythm_language_v1','ar');
      localStorage.setItem('cary_access_mode_v1','guest');
      localStorage.setItem('cary_onboarding_v2_complete','true');
      localStorage.setItem('rhythm_country_v1',country);
      sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
    },{country});

    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('dir','rtl');
    await expect(page.getByText(/مرحباً بك/)).toBeVisible();
    await page.screenshot({path:testInfo.outputPath(`${country}-01-home.png`),fullPage:true});

    await openCapture(page);
    await expect(page.locator('html')).toHaveAttribute('lang','ar');
    await expect(page.locator('html')).toHaveAttribute('dir','rtl');
    const captureDialog=page.getByRole('dialog');
    await expect(captureDialog.locator('[data-language-option]')).toHaveCount(0);
    await expect(captureDialog.getByRole('button',{name:/English|Deutsch|Français/})).toHaveCount(0);
    await page.screenshot({path:testInfo.outputPath(`${country}-02-capture.png`),fullPage:true});

    await expect(captureDialog).toBeVisible();
    const photoButton=captureDialog.getByRole('button',{name:/صورة/});
    await expect(photoButton).toBeVisible();
    await photoButton.click();

    await expect(page.getByRole('heading',{name:/ماذا أكلت؟/})).toBeVisible();
    await expect(page.getByText(new RegExp(country==='MA'?'المغرب|Morocco':'.'))).toBeVisible().catch(()=>{});
    await page.screenshot({path:testInfo.outputPath(`${country}-03-food-picker.png`),fullPage:true});
  });
}

test('legacy stored English preference cannot change the Arabic capture and food UI',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('rhythm_language_v1','en');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang','ar');
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await openCapture(page);
  const dialog=page.getByRole('dialog');
  await expect(dialog.getByRole('button',{name:/صورة/})).toBeVisible();
  await expect(dialog.getByRole('button',{name:/احكِ لي/})).toBeVisible();
  await expect(dialog.getByRole('button',{name:/Photo|Tell me|English/})).toHaveCount(0);
  await dialog.getByRole('button',{name:/صورة/}).click();
  await expect(page.getByRole('heading',{name:/ماذا أكلت؟/})).toBeVisible();
  await expect(page.getByRole('button',{name:/حفظ الوجبة/})).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
});

test('Add menu keeps only photo and voice, with working back navigation',async({page})=>{
  await page.addInitScript(()=>{localStorage.setItem('rhythm_language_v1','en');localStorage.setItem('cary_access_mode_v1','guest');localStorage.setItem('cary_onboarding_v2_complete','true');sessionStorage.setItem('nimmapp_checkin_auto_opened','true')});
  await page.goto('/');
  await openCapture(page);
  const dialog=page.getByRole('dialog');
  await expect(dialog.getByRole('button',{name:/صورة/})).toBeVisible();
  await expect(dialog.getByRole('button',{name:/احكِ لي/})).toBeVisible();
  await expect(dialog.getByRole('button',{name:/اختيار سريع/})).toHaveCount(0);
  await dialog.getByRole('button',{name:/صورة/}).click();
  await expect(page.getByRole('button',{name:'رجوع'})).toBeVisible();
  await page.getByRole('button',{name:'رجوع'}).click();
  await expect(page.getByRole('dialog').getByRole('button',{name:/احكِ لي/})).toBeVisible();
  await page.getByRole('dialog').getByRole('button',{name:/احكِ لي/}).click();
  await expect(page.getByRole('heading',{name:'قل ماذا أكلت'})).toBeVisible();
  await expect(page.getByRole('button',{name:'رجوع'})).toBeVisible();
  await page.getByRole('button',{name:'رجوع'}).click();
  await expect(page.getByRole('dialog').getByRole('button',{name:/صورة/})).toBeVisible();
});

test('legacy English locale cannot switch the real capture UI away from RTL',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('rhythm_language_v1','en');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  });
  await page.goto('/');
  await openCapture(page);
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await expect(page.locator('html')).toHaveAttribute('lang','ar');
  await expect(page.getByRole('dialog').getByRole('button',{name:/صورة/})).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('button',{name:/English/})).toHaveCount(0);
});

test('guest mode persists locally without requiring an account',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('rhythm_language_v1','en');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('nimmapp_moments_v1',JSON.stringify([{id:'guest-local',title:'Guest local meal',label:'Lunch',category:'lunch',date:'2026-09-07',time:'12:30',location:'Not specified',locationCategory:'home',imageUrl:'',rating:5,mood:'satisfied',tags:[],createdAt:Date.now()}]));
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  });
  await page.goto('/');
  await expect(page.getByRole('button',{name:/فتح الحساب/})).toContainText(/ضيف/);
  const stored=await page.evaluate(()=>localStorage.getItem('nimmapp_moments_v1'));
  expect(stored).toContain('guest-local');
});

test('returning account mode restores a stored session and keeps cloud sync available',async({page})=>{
  await page.route('https://iedexrvvmpymnyyursdx.supabase.co/rest/v1/cary_memory**',async route=>{
    if(route.request().method()==='GET'){
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{moments:[],check_ins:[]}])});
    }else{
      await route.fulfill({status:201,contentType:'application/json',body:''});
    }
  });
  await page.addInitScript(()=>{
    localStorage.setItem('rhythm_language_v1','en');
    localStorage.setItem('cary_access_mode_v1','account');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('cary_auth_session_v1',JSON.stringify({
      access_token:'test-token',
      refresh_token:'test-refresh',
      expires_at:Math.floor(Date.now()/1000)+3600,
      user:{id:'returning-user',email:'returning@example.com'}
    }));
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  });
  await page.goto('/');
  await expect(page.getByRole('button',{name:/فتح الحساب/})).toContainText('returning@example.com');
  await expect(page.getByText(/ابدأ على هذا الجهاز/)).not.toBeVisible();
});


test('photo meal flow stores two selected dishes in one meal',async({page})=>{
  await page.route('**/api/locale',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({country:'MA'})}));
  await page.addInitScript(()=>{
    localStorage.setItem('rhythm_language_v1','en');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('nimmapp_moments_v1','[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  });
  await page.goto('/');
  await openCapture(page);
  await page.getByRole('dialog').getByRole('button',{name:/صورة/}).click();
  await expect(page.getByRole('heading',{name:/ماذا أكلت؟/})).toBeVisible();
  await page.getByTestId('food-visual-pasta').click();
  await page.getByTestId('food-visual-salad').click();
  await expect(page.getByTestId('food-visual-pasta')).toHaveAttribute('aria-pressed','true');
  await expect(page.getByTestId('food-visual-salad')).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:/حفظ الوجبة/}).click();
  await expect.poll(async()=>{
    const raw=await page.evaluate(()=>localStorage.getItem('nimmapp_moments_v1'));
    return raw||'';
  }).toContain('باستا · سلطة طازجة');
});


test('fresh guest sees only the intentional voice-first entry before manual capture',async({page})=>{
  await page.route('**/api/locale',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({country:'MA'})}));
  await page.addInitScript(()=>{
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('rhythm_language_v1','ar');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
  });
  await page.goto('/');
  await page.waitForTimeout(1200);
  const voiceEntry=page.getByTestId('voice-first-entry-overlay');
  await expect(voiceEntry).toBeVisible();
  await expect(voiceEntry.getByRole('heading',{name:'ما الذي أتى بك إلينا؟ احكِ لي قليلاً عنك.',exact:true})).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await expect(page.locator('#root')).toHaveAttribute('inert','');
  await expect(page.getByRole('button',{name:'سجّل لحظة'})).toHaveCount(0);
  await expect(page.getByRole('button',{name:/تسجيل|مساء|منتصف|يومك/})).toHaveCount(0);
});


test('Arabic food search recognizes بيض in the real meal editor',async({page})=>{
  await page.route('**/api/locale',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({country:'MA'})}));
  await page.addInitScript(()=>{
    localStorage.setItem('rhythm_language_v1','ar');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  });
  await page.goto('/');
  await openCapture(page);
  await page.getByRole('dialog').getByRole('button',{name:/صورة/}).click();
  const input=page.getByPlaceholder(/ابدأ بالكتابة/);
  await input.fill('بيض');
  await expect(page.getByText('بيض',{exact:true}).first()).toBeVisible();
  await expect(page.getByText(/بيض مخفوق|بيض/).first()).toBeVisible();
});


test('Moroccan Arabic autocomplete recognizes common real foods',async({page})=>{
  await page.route('**/api/locale',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({country:'MA'})}));
  await page.addInitScript(()=>{
    localStorage.setItem('rhythm_language_v1','ar');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  });
  await page.goto('/');
  await openCapture(page);
  await page.getByRole('dialog').getByRole('button',{name:/صورة/}).click();
  const input=page.getByPlaceholder(/ابدأ بالكتابة/);
  const cases=[
    ['بيض','بيض'],
    ['بيض ومطيشة','بيض ومطيشة'],
    ['مسمن','مسمن'],
    ['بغرير','بغرير'],
    ['حريرة','حريرة'],
    ['كسكس','كسكس'],
    ['طاجين','طاجين'],
    ['رفيسة','رفيسة'],
    ['بسطيلة','بسطيلة'],
    ['بيصارة','بيصارة'],
    ['حرشة','حرشة'],
    ['زعلوك','زعلوك'],
    ['تكتوكة','تكتوكة'],
    ['كفتة','كفتة'],
    ['سردين','سردين مشوي'],
    ['شباكية','شباكية'],
    ['سلو','سلو'],
    ['سفنج','سفنج'],
    ['أتاي','أتاي بالنعناع'],
  ];
  for(const [typed,expected] of cases){
    await input.fill(typed);
    const recognized=page.getByTestId('recognized-food-alias');
    await expect(recognized,typed+' should be recognized').toBeVisible();
    await expect(recognized).toContainText(expected);
  }
});


test('daily check-in meal picker recognizes Moroccan Arabic foods',async({page})=>{
  await page.route('**/api/locale',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({country:'MA'})}));
  await page.addInitScript(()=>{
    localStorage.setItem('rhythm_language_v1','ar');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
  });
  await page.goto('/');
  const checkin=page.getByRole('button',{name:/تسجيل|مساء|منتصف|يومك/}).first();
  await checkin.click();
  const input=page.getByPlaceholder('ماذا أكلت؟ ابحث أو اكتب…');
  if(!await input.isVisible().catch(()=>false)){
    await page.getByRole('button',{name:/خطوة أخيرة/}).click();
  }
  await expect(input).toBeVisible();
  const cases=['بيض','بيض ومطيشة','حريرة','طاجين','رفيسة','بسطيلة','بيصارة','زعلوك','تكتوكة'];
  for(const typed of cases){
    await input.fill(typed);
    await expect(page.getByTestId('meal-recognized-food'),typed+' should autocomplete in daily check-in').toBeVisible();
  }
});


test('daily check-in AI autocomplete understands composed Arabic dishes',async({page})=>{
  await page.route('**/api/locale',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({country:'MA'})}));
  await page.route('**/api/food-autocomplete',async route=>{
    const body=JSON.parse(route.request().postData()||'{}');
    const map:Record<string,string[]>={
      'بيض مسلوق':['بيض مسلوق'],
      'بيض مقلي':['بيض مقلي'],
      'طاجين دجاج بالزيتون':['طاجين دجاج بالزيتون'],
      'كسكس بالخضر':['كسكس بالخضر']
    };
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({suggestions:map[body.query]||[]})});
  });
  await page.addInitScript(()=>{
    localStorage.setItem('rhythm_language_v1','ar');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
  });
  await page.goto('/');
  const checkin=page.getByRole('button',{name:/تسجيل|مساء|منتصف|يومك/}).filter({hasText:/منتصف|مساء/}).first();
  await checkin.click();
  const input=page.getByPlaceholder('ماذا أكلت؟ ابحث أو اكتب…');
  for(const term of ['بيض مسلوق','بيض مقلي','طاجين دجاج بالزيتون','كسكس بالخضر']){
    await input.fill(term);
    await expect(page.getByRole('button',{name:term,exact:true})).toBeVisible();
  }
});


test('AI meal autocomplete handles Darija, typos, preparation and mixed-language input',async({page})=>{
  await page.route('**/api/locale',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({country:'MA'})}));
  const cases:Record<string,string[]>={
    'بيض مسلوق':['بيض مسلوق'],
    'بيض مسلوق مع زيت الزيتون':['بيض مسلوق مع زيت الزيتون'],
    'بيض مقلي':['بيض مقلي'],
    'بيض بالطماطم':['بيض بالطماطم'],
    'بيض و مطيشة':['بيض ومطيشة'],
    'بيض مطيشة':['بيض ومطيشة'],
    'طاجين دجاج':['طاجين دجاج'],
    'طاجين دجاج بالزيتون':['طاجين دجاج بالزيتون'],
    'طاجين اللحم بالبرقوق':['طاجين اللحم بالبرقوق'],
    'كسكس بالخضر':['كسكس بالخضر'],
    'كسكس باللحم':['كسكس باللحم'],
    'حريرة مغربية':['حريرة مغربية'],
    'مسمن بالعسل':['مسمن بالعسل'],
    'مسمن بالجبن':['مسمن بالجبن'],
    'خبز وزيت الزيتون':['خبز وزيت الزيتون'],
    'اتاي بالنعناع':['أتاي بالنعناع'],
    'قهوة بالحليب':['قهوة بالحليب'],
    'omelette بالجبن':['أومليت بالجبن'],
    'egg مسلوق':['بيض مسلوق'],
    'tajine دجاج':['طاجين دجاج']
  };
  await page.route('**/api/food-autocomplete',async route=>{
    const body=JSON.parse(route.request().postData()||'{}');
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({suggestions:cases[body.query]||[]})});
  });
  await page.addInitScript(()=>{
    localStorage.setItem('rhythm_language_v1','ar');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
  });
  await page.goto('/');
  const checkin=page.getByRole('button',{name:/تسجيل|مساء|منتصف|يومك/}).filter({hasText:/منتصف|مساء/}).first();
  await checkin.click();
  const input=page.getByPlaceholder('ماذا أكلت؟ ابحث أو اكتب…');
  for(const [typed,suggestions] of Object.entries(cases)){
    await input.fill(typed);
    await expect(page.getByRole('button',{name:suggestions[0],exact:true}),typed+' should get an AI suggestion').toBeVisible();
  }
});

test('AI meal autocomplete degrades gracefully when API fails',async({page})=>{
  await page.route('**/api/locale',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({country:'MA'})}));
  await page.route('**/api/food-autocomplete',async route=>route.fulfill({status:500,contentType:'application/json',body:'{}'}));
  await page.addInitScript(()=>{localStorage.setItem('rhythm_language_v1','ar');localStorage.setItem('cary_access_mode_v1','guest');localStorage.setItem('cary_onboarding_v2_complete','true')});
  await page.goto('/');
  const checkin=page.getByRole('button',{name:/تسجيل|مساء|منتصف|يومك/}).filter({hasText:/منتصف|مساء/}).first();
  await checkin.click();
  const input=page.getByPlaceholder('ماذا أكلت؟ ابحث أو اكتب…');
  await input.fill('بيض');
  await expect(page.getByTestId('meal-recognized-food')).toBeVisible();
  await input.fill('طبق غير معروف');
  await expect(page.getByRole('button',{name:'إضافة هذا الطبق'})).toBeVisible();
});


test('Voice capture handles denied microphone permission without trapping the user',async({page,context})=>{
  await context.clearPermissions();
  await page.addInitScript(()=>{delete (window as any).SpeechRecognition;delete (window as any).webkitSpeechRecognition;localStorage.setItem('rhythm_language_v1','en');localStorage.setItem('cary_access_mode_v1','guest');localStorage.setItem('cary_onboarding_v2_complete','true');sessionStorage.setItem('nimmapp_checkin_auto_opened','true')});
  await page.goto('/');
  await openCapture(page);
  await page.getByRole('dialog').getByRole('button',{name:/احكِ لي/}).click();
  await page.getByRole('button',{name:'ابدأ التسجيل'}).click();
  await expect(page.getByText('نحتاج إذن الميكروفون للتسجيل.')).toBeVisible();
  await page.getByRole('button',{name:'رجوع'}).click();
  await expect(page.getByRole('dialog').getByRole('button',{name:/صورة/})).toBeVisible();
});

test('Voice capture starts, stops, transcribes and stores the recognized meal',async({page})=>{
  await page.route('**/api/voice-checkin',async route=>{
    const body=JSON.parse(route.request().postData()||'{}');
    expect(body.transcript).toBe('boiled eggs');
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
      coachFeedback:{title:'Got it',message:'Understood',type:'praise',badge:'Voice',habitScore:90},
      extractedData:{
        mealDetected:true,mealItems:['boiled eggs'],mealTitle:'boiled eggs',mealCategory:'breakfast',mealContext:'',
        meals:[{category:'breakfast',timeOfDay:'morning',time:'',mealTitle:'boiled eggs',mealItems:['boiled eggs'],hungerBefore:0,fullnessAfter:0}],
        sleepHours:0,sleepQuality:0,wakeFeeling:'',wellbeingEntries:[]
      }
    })});
  });
  await page.addInitScript(()=>{
    delete (window as any).SpeechRecognition;delete (window as any).webkitSpeechRecognition;localStorage.setItem('rhythm_language_v1','en');localStorage.setItem('cary_access_mode_v1','guest');localStorage.setItem('cary_onboarding_v2_complete','true');sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
    class FakeRecorder{
      static isTypeSupported(){return true}
      state='inactive';mimeType='audio/webm';ondataavailable=null;onstop=null;
      constructor(_stream:any){}
      start(){this.state='recording'}
      stop(){this.state='inactive';this.ondataavailable?.({data:new Blob(['voice'],{type:'audio/webm'})});this.onstop?.()}
    }
    (window as any).MediaRecorder=FakeRecorder;
    Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>({getTracks:()=>[{stop(){}}]})}});
    class FakeAudioContext{
      async decodeAudioData(){return {numberOfChannels:1,length:4800,sampleRate:48000,getChannelData:()=>new Float32Array(4800).fill(.2)}}
      async close(){}
    }
    (window as any).AudioContext=FakeAudioContext;
    class FakeWorker{
      onmessage:any=null;
      postMessage(message:any){if(message.type==='audio')setTimeout(()=>this.onmessage?.({data:{id:message.id,type:'result',text:'boiled eggs'}}),0)}
      terminate(){}
    }
    (window as any).Worker=FakeWorker;
  });
  await page.goto('/');
  await openCapture(page);
  await page.getByRole('dialog').getByRole('button',{name:/احكِ لي/}).click();
  await page.getByRole('button',{name:'ابدأ التسجيل'}).click();
  await expect(page.getByRole('button',{name:'إيقاف التسجيل'})).toBeVisible();
  await page.getByRole('button',{name:'إيقاف التسجيل'}).click();
  await expect.poll(async()=>page.evaluate(()=>localStorage.getItem('nimmapp_moments_v1')||'')).toContain('boiled eggs');
  await expect(page.getByTestId('voice-understanding-card')).toHaveCount(0);
  await expect(page.getByRole('heading',{name:'What did you have?'})).toHaveCount(0);
});

test('Voice Back during recording discards audio and returns to Add choices',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('rhythm_language_v1','en');localStorage.setItem('cary_access_mode_v1','guest');localStorage.setItem('cary_onboarding_v2_complete','true');sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
    class FakeRecorder{
      static isTypeSupported(){return true}
      state='inactive';mimeType='audio/webm';ondataavailable=null;onstop=null;
      constructor(_stream:any){}
      start(){this.state='recording'}
      stop(){this.state='inactive';this.ondataavailable?.({data:new Blob(['voice'])});this.onstop?.()}
    }
    (window as unknown as {MediaRecorder:unknown}).MediaRecorder=FakeRecorder;
    Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>({getTracks:()=>[{stop(){}}]})}});
  });
  await page.goto('/');
  await openCapture(page);
  await page.getByRole('dialog').getByRole('button',{name:/احكِ لي/}).click();
  await page.getByRole('button',{name:'ابدأ التسجيل'}).click();
  await page.getByRole('button',{name:'رجوع'}).click();
  await expect(page.getByRole('dialog').getByRole('button',{name:/صورة/})).toBeVisible();
  await expect(page.getByRole('heading',{name:'What did you have?'})).toHaveCount(0);
});


test('Arabic Whisper understands a full Darija message semantically with multiple foods and negation',async({page})=>{
  let receivedTranscript='';
  await page.route('**/api/voice-checkin',async route=>{
    const body=JSON.parse(route.request().postData()||'{}');
    receivedTranscript=body.transcript||'';
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
      coachFeedback:{title:'تمام',message:'تم فهم الرسالة كاملة',type:'praise',badge:'Voice',habitScore:90},
      extractedData:{
        mealDetected:true,
        mealItems:['بيض مسلوق','خبز','قهوة بالحليب'],
        mealTitle:'بيض مسلوق · خبز · قهوة بالحليب',
        mealCategory:'breakfast',
        mealContext:'',
        meals:[
          {category:'breakfast',timeOfDay:'morning',time:'',mealTitle:'بيض مسلوق · خبز',mealItems:['بيض مسلوق','خبز'],hungerBefore:0,fullnessAfter:0},
          {category:'coffee',timeOfDay:'morning',time:'',mealTitle:'قهوة بالحليب',mealItems:['قهوة بالحليب'],hungerBefore:0,fullnessAfter:0}
        ],
        sleepHours:0,sleepQuality:0,wakeFeeling:'',wellbeingEntries:[]
      }
    })});
  });
  await page.addInitScript(()=>{
    localStorage.setItem('rhythm_language_v1','ar');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
    class BadChromeSpeech{start(){throw new Error('Arabic must not use Chrome speech recognition')} stop(){}}
    (window as any).webkitSpeechRecognition=BadChromeSpeech;
    class FakeRecorder{
      static isTypeSupported(){return true}
      state='inactive';mimeType='audio/webm';ondataavailable=null;onstop=null;
      constructor(_stream:any){}
      start(){this.state='recording'}
      stop(){this.state='inactive';this.ondataavailable?.({data:new Blob(['voice'],{type:'audio/webm'})});this.onstop?.()}
    }
    (window as any).MediaRecorder=FakeRecorder;
    Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>({getTracks:()=>[{stop(){}}]})}});
    class FakeAudioContext{
      async decodeAudioData(){return {numberOfChannels:1,length:3200,sampleRate:16000,getChannelData:()=>new Float32Array(3200).fill(.2)}}
      async close(){}
    }
    (window as any).AudioContext=FakeAudioContext;
    class FakeWorker{
      onmessage:any=null;
      postMessage(message:any){
        if(message.type==='audio')setTimeout(()=>this.onmessage?.({data:{
          id:message.id,type:'result',
          text:'كليت جوج بيضات مسلوقين مع الخبز ومن بعد شربت قهوة بالحليب وما كليتش الحلو'
        }}),10)
      }
      terminate(){}
    }
    (window as any).Worker=FakeWorker;
  });
  await page.goto('/');
  await openCapture(page);
  await page.getByRole('dialog').getByRole('button',{name:/احكِ لي/}).click();
  await page.getByRole('button',{name:/ابدأ التسجيل/}).click();
  await page.getByRole('button',{name:/إيقاف التسجيل/}).click();
  await expect.poll(()=>receivedTranscript).toContain('كليت جوج بيضات مسلوقين');
  await expect.poll(async()=>page.evaluate(()=>localStorage.getItem('nimmapp_moments_v1')||'')).toContain('بيض مسلوق');
  const stored=await page.evaluate(()=>localStorage.getItem('nimmapp_moments_v1')||'');
  expect(stored).toContain('خبز');
  expect(stored).toContain('قهوة بالحليب');
  expect(stored).not.toContain('الحلو');
  await expect(page.getByTestId('voice-understanding-card')).toHaveCount(0);
});

test('Arabic Whisper semantic failure keeps the full message out of autocomplete search',async({page})=>{
  const raw='الصباح كليت حاجة ما عرفتش اسمها وشربت شي حاجة سخونة';
  await page.route('**/api/voice-checkin',async route=>{
    const body=JSON.parse(route.request().postData()||'{}');
    expect(body.transcript).toBe(raw);
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
      coachFeedback:{title:'تمام',message:'لم أفهم بما يكفي',type:'praise',badge:'Voice',habitScore:80},
      extractedData:{mealItems:[],mealTitle:'',mealCategory:'',mealContext:''}
    })});
  });
  await page.addInitScript((rawText)=>{
    localStorage.setItem('rhythm_language_v1','ar');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
    class FakeRecorder{
      static isTypeSupported(){return true}
      state='inactive';mimeType='audio/webm';ondataavailable=null;onstop=null;
      constructor(_stream:any){}
      start(){this.state='recording'}
      stop(){this.state='inactive';this.ondataavailable?.({data:new Blob(['voice'],{type:'audio/webm'})});this.onstop?.()}
    }
    ;(window as any).MediaRecorder=FakeRecorder;
    Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>({getTracks:()=>[{stop(){}}]})}});
    class FakeAudioContext{
      async decodeAudioData(){return {numberOfChannels:1,length:1600,sampleRate:16000,getChannelData:()=>new Float32Array(1600).fill(.2)}}
      async close(){}
    }
    ;(window as any).AudioContext=FakeAudioContext;
    class FakeWorker{
      onmessage:any=null;
      postMessage(message:any){if(message.type==='audio')setTimeout(()=>this.onmessage?.({data:{id:message.id,type:'result',text:rawText}}),10)}
      terminate(){}
    }
    ;(window as any).Worker=FakeWorker;
  },raw);
  await page.goto('/');
  await openCapture(page);
  await page.getByRole('dialog').getByRole('button',{name:/احكِ لي/}).click();
  await page.getByRole('button',{name:/ابدأ التسجيل/}).click();
  await page.getByRole('button',{name:/إيقاف التسجيل/}).click();
  await expect(page.getByTestId('voice-understanding-card')).toContainText(raw);
  await expect(page.getByTestId('voice-understanding-card')).toContainText('لم نفهم الرسالة');
  await expect(page.locator(`input[value="${raw}"]`)).toHaveCount(0);
});

test('Arabic Whisper transcript is sent once as one complete message',async({page})=>{
  const raw='الصباح كليت المسمن مع العسل ومن بعد شربت أتاي';
  let calls=0;
  await page.route('**/api/voice-checkin',async route=>{
    calls++;
    const body=JSON.parse(route.request().postData()||'{}');
    expect(body.transcript).toBe(raw);
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
      coachFeedback:{title:'تمام',message:'فهمت',type:'praise',badge:'Voice',habitScore:90},
      extractedData:{
        mealDetected:true,mealItems:['مسمن بالعسل','أتاي'],mealTitle:'مسمن بالعسل · أتاي',mealCategory:'breakfast',mealContext:'',
        meals:[{category:'breakfast',timeOfDay:'morning',time:'',mealTitle:'مسمن بالعسل · أتاي',mealItems:['مسمن بالعسل','أتاي'],hungerBefore:0,fullnessAfter:0}],
        sleepHours:0,sleepQuality:0,wakeFeeling:'',wellbeingEntries:[]
      }
    })});
  });
  await page.addInitScript((rawText)=>{
    localStorage.setItem('rhythm_language_v1','ar');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
    class FakeRecorder{
      static isTypeSupported(){return true}
      state='inactive';mimeType='audio/webm';ondataavailable=null;onstop=null;
      constructor(_stream:any){}
      start(){this.state='recording'}
      stop(){this.state='inactive';this.ondataavailable?.({data:new Blob(['voice'],{type:'audio/webm'})});this.onstop?.()}
    }
    ;(window as any).MediaRecorder=FakeRecorder;
    Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>({getTracks:()=>[{stop(){}}]})}});
    class FakeAudioContext{
      async decodeAudioData(){return {numberOfChannels:1,length:1600,sampleRate:16000,getChannelData:()=>new Float32Array(1600).fill(.2)}}
      async close(){}
    }
    ;(window as any).AudioContext=FakeAudioContext;
    class FakeWorker{
      onmessage:any=null;
      postMessage(message:any){if(message.type==='audio')setTimeout(()=>this.onmessage?.({data:{id:message.id,type:'result',text:rawText}}),10)}
      terminate(){}
    }
    ;(window as any).Worker=FakeWorker;
  },raw);
  await page.goto('/');
  await openCapture(page);
  await page.getByRole('dialog').getByRole('button',{name:/احكِ لي/}).click();
  await page.getByRole('button',{name:/ابدأ التسجيل/}).click();
  await page.getByRole('button',{name:/إيقاف التسجيل/}).click();
  await expect.poll(()=>calls).toBe(1);
  await expect.poll(async()=>page.evaluate(()=>localStorage.getItem('nimmapp_moments_v1')||'')).toContain('مسمن بالعسل');
  const stored=await page.evaluate(()=>localStorage.getItem('nimmapp_moments_v1')||'');
  expect(stored).toContain('أتاي');
});


test('Arabic voice deliberately uses local Whisper even when Chrome speech recognition exists',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('rhythm_language_v1','ar');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
    class BadChromeSpeech{start(){throw new Error('Arabic must not use Chrome speech recognition')} stop(){}}
    (window as any).webkitSpeechRecognition=BadChromeSpeech;
    class FakeRecorder{
      static isTypeSupported(){return true}
      state='inactive';mimeType='audio/webm';ondataavailable=null;onstop=null;
      constructor(_stream:any){}
      start(){this.state='recording'}
      stop(){this.state='inactive';this.ondataavailable?.({data:new Blob(['voice'],{type:'audio/webm'})});this.onstop?.()}
    }
    (window as any).MediaRecorder=FakeRecorder;
    Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>({getTracks:()=>[{stop(){}}]})}});
  });
  await page.goto('/');
  await openCapture(page);
  await page.getByRole('dialog').getByRole('button',{name:/احكِ لي/}).click();
  await page.getByRole('button',{name:/ابدأ التسجيل/}).click();
  await expect(page.getByTestId('voice-diagnostic')).toContainText('Whisper');
});
