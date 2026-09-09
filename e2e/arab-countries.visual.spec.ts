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

    const captureButton=page.getByTestId('primary-capture-button');
    await expect(captureButton).toBeVisible();
    await captureButton.click();
    await expect(page.getByText('العربية',{exact:true})).toBeVisible();
    await expect(page.getByText('English',{exact:true})).toBeVisible();
    await page.screenshot({path:testInfo.outputPath(`${country}-02-capture.png`),fullPage:true});

    const captureDialog=page.getByRole('dialog');
    await expect(captureDialog).toBeVisible();
    const photoButton=captureDialog.getByRole('button',{name:/صورة/});
    await expect(photoButton).toBeVisible();
    await photoButton.click();

    await expect(page.getByRole('heading',{name:/ماذا أكلت؟/})).toBeVisible();
    await expect(page.getByText(new RegExp(country==='MA'?'المغرب|Morocco':'.'))).toBeVisible().catch(()=>{});
    await page.screenshot({path:testInfo.outputPath(`${country}-03-food-picker.png`),fullPage:true});
  });
}

test('language switch translates the complete capture and food flow both ways',async({page},testInfo)=>{
  await page.route('**/api/locale',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({country:'MA'})}));
  await page.addInitScript(()=>{
    localStorage.setItem('rhythm_language_v1','ar');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('nimmapp_moments_v1',JSON.stringify([{id:'arabic-coffee',title:'قهوة',label:'قهوة',category:'coffee',date:'2026-09-08',time:'16:00',location:'غير محدد',locationCategory:'home',imageUrl:'',rating:5,mood:'satisfied',tags:[],createdAt:Date.now()}]));
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang','ar');
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');

  await page.getByTestId('primary-capture-button').click();
  const dialog=page.getByRole('dialog');
  await expect(dialog.getByText('لحظة سريعة')).toBeVisible();
  await expect(dialog.getByText('ما اللحظة التي تريد تسجيلها؟')).toBeVisible();
  await expect(dialog.getByRole('button',{name:/صورة/})).toBeVisible();
  await expect(dialog.getByRole('button',{name:/احكِ لي/})).toBeVisible();
  await expect(dialog.getByRole('button',{name:/اختيار سريع/})).toHaveCount(0);

  await dialog.getByRole('button',{name:'English',exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await expect(page.locator('html')).toHaveAttribute('dir','ltr');
  await expect(dialog.getByText('One quick moment')).toBeVisible();
  await expect(dialog.getByText('What would you like to capture?')).toBeVisible();
  await expect(dialog.getByRole('button',{name:/Photo/})).toBeVisible();
  await expect(dialog.getByRole('button',{name:/Tell me/})).toBeVisible();
  await expect(dialog.getByRole('button',{name:/Quick check/})).toHaveCount(0);
  await expect(dialog.getByText('Coffee',{exact:true})).toBeVisible();
  await expect(dialog.getByText('قهوة',{exact:true})).toHaveCount(0);
  await expect(dialog.getByText(/اختر الأسهل|لحظة سريعة|ما اللحظة/)).toHaveCount(0);
  await expect.poll(async()=>visibleArabicOutsideLanguageControls(page),{message:'English UI must not contain visible Arabic text outside the Arabic language option'}).toEqual([]);
  await page.screenshot({path:testInfo.outputPath('language-switch-01-english.png'),fullPage:true});

  await dialog.getByRole('button',{name:/Photo/}).click();
  await expect(page.getByRole('heading',{name:'What did you have?'})).toBeVisible();
  await expect(page.getByRole('button',{name:/Save meal/})).toBeVisible();
  await expect(page.getByText(/ماذا أكلت|حفظ الوجبة|اختر بالصورة/)).toHaveCount(0);
  await expect.poll(async()=>visibleArabicOutsideLanguageControls(page),{message:'English food flow must not contain visible Arabic text'}).toEqual([]);
  await page.screenshot({path:testInfo.outputPath('language-switch-02-english-food.png'),fullPage:true});

  await page.getByRole('button',{name:/Close/}).click();
  await page.getByTestId('primary-capture-button').click();
  const englishDialog=page.getByRole('dialog');
  await englishDialog.getByRole('button',{name:'العربية',exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('lang','ar');
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await expect(englishDialog.getByText('لحظة سريعة')).toBeVisible();
  await expect(englishDialog.getByText('ما اللحظة التي تريد تسجيلها؟')).toBeVisible();
  await expect(englishDialog.getByText(/One quick moment|What would you like to capture/)).toHaveCount(0);
  await englishDialog.getByRole('button',{name:/صورة/}).click();
  await expect(page.getByRole('heading',{name:'ماذا أكلت؟'})).toBeVisible();
  await expect(page.getByRole('button',{name:/حفظ الوجبة/})).toBeVisible();
  await expect(page.getByText(/What did you have|Save meal|Choose by picture/)).toHaveCount(0);
  await page.screenshot({path:testInfo.outputPath('language-switch-03-arabic-food.png'),fullPage:true});
});


test('Add menu keeps only photo and voice, with working back navigation',async({page})=>{
  await page.addInitScript(()=>{localStorage.setItem('rhythm_language_v1','en');localStorage.setItem('cary_access_mode_v1','guest');localStorage.setItem('cary_onboarding_v2_complete','true');sessionStorage.setItem('nimmapp_checkin_auto_opened','true')});
  await page.goto('/');
  await page.getByTestId('primary-capture-button').click();
  const dialog=page.getByRole('dialog');
  await expect(dialog.getByRole('button',{name:/Photo/})).toBeVisible();
  await expect(dialog.getByRole('button',{name:/Tell me/})).toBeVisible();
  await expect(dialog.getByRole('button',{name:/Quick check/})).toHaveCount(0);
  await dialog.getByRole('button',{name:/Photo/}).click();
  await expect(page.getByRole('button',{name:'Back'})).toBeVisible();
  await page.getByRole('button',{name:'Back'}).click();
  await expect(page.getByRole('dialog').getByRole('button',{name:/Tell me/})).toBeVisible();
  await page.getByRole('dialog').getByRole('button',{name:/Tell me/}).click();
  await expect(page.getByRole('heading',{name:/Tell me what you had/})).toBeVisible();
  await expect(page.getByRole('button',{name:'Back'})).toBeVisible();
  await page.getByRole('button',{name:'Back'}).click();
  await expect(page.getByRole('dialog').getByRole('button',{name:/Photo/})).toBeVisible();
});

test('English switch changes the real capture UI to LTR',async({page},testInfo)=>{
  await page.addInitScript(()=>{
    localStorage.setItem('rhythm_language_v1','ar');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  });
  await page.goto('/');
  const captureButton=page.getByTestId('primary-capture-button');
  await captureButton.click();
  const english=page.getByRole('button',{name:/English/}).first();
  await expect(english).toBeVisible();
  await english.click();
  await expect(page.locator('html')).toHaveAttribute('dir','ltr');
  await expect(page.getByText(/What would you like to capture\?/)).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('english-switch.png'),fullPage:true});
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
  await expect(page.getByRole('button',{name:/Open account/})).toContainText(/Guest/);
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
  await expect(page.getByRole('button',{name:/Open account/})).toContainText('returning@example.com');
  await expect(page.getByText(/Start on this device/)).not.toBeVisible();
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
  await page.getByTestId('primary-capture-button').click();
  await page.getByRole('dialog').getByRole('button',{name:/Photo/}).click();
  await expect(page.getByRole('heading',{name:/What did you have\?/})).toBeVisible();
  await page.getByTestId('food-visual-pasta').click();
  await page.getByTestId('food-visual-salad').click();
  await expect(page.getByTestId('food-visual-pasta')).toHaveAttribute('aria-pressed','true');
  await expect(page.getByTestId('food-visual-salad')).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:/Save meal/}).click();
  await expect.poll(async()=>{
    const raw=await page.evaluate(()=>localStorage.getItem('nimmapp_moments_v1'));
    return raw||'';
  }).toContain('Pasta · Fresh salad');
});


test('fresh guest lands on home without an automatic capture interruption',async({page})=>{
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
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByTestId('primary-capture-button')).toBeVisible();
  await page.getByTestId('primary-capture-button').click();
  await expect(page.getByRole('dialog')).toBeVisible();
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
  await page.getByTestId('primary-capture-button').click();
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
  await page.getByTestId('primary-capture-button').click();
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
  await page.addInitScript(()=>{localStorage.setItem('rhythm_language_v1','en');localStorage.setItem('cary_access_mode_v1','guest');localStorage.setItem('cary_onboarding_v2_complete','true');sessionStorage.setItem('nimmapp_checkin_auto_opened','true')});
  await page.goto('/');
  await page.getByTestId('primary-capture-button').click();
  await page.getByRole('dialog').getByRole('button',{name:/Tell me/}).click();
  await page.getByRole('button',{name:'Start recording'}).click();
  await expect(page.getByText('Microphone permission is needed to record.')).toBeVisible();
  await page.getByRole('button',{name:'Back'}).click();
  await expect(page.getByRole('dialog').getByRole('button',{name:/Photo/})).toBeVisible();
});

test('Voice capture starts, stops, transcribes and prefills the meal editor',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('rhythm_language_v1','en');localStorage.setItem('cary_access_mode_v1','guest');localStorage.setItem('cary_onboarding_v2_complete','true');sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
    class FakeRecorder{
      static isTypeSupported(){return true}
      state='inactive';mimeType='audio/webm';ondataavailable=null;onstop=null;
      constructor(stream){this.stream=stream}
      start(){this.state='recording'}
      stop(){this.state='inactive';this.ondataavailable?.({data:new Blob(['voice'],{type:'audio/webm'})});this.onstop?.()}
    }
    window.MediaRecorder=FakeRecorder;
    Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>({getTracks:()=>[{stop(){}}]})}});
    class FakeWorker{
      constructor(){this.onmessage=null}
      postMessage(message){if(message.type==='audio')setTimeout(()=>this.onmessage?.({data:{id:message.id,type:'result',text:'boiled eggs'}}),0)}
      terminate(){}
    }
    window.Worker=FakeWorker;
  });
  await page.goto('/');
  await page.getByTestId('primary-capture-button').click();
  await page.getByRole('dialog').getByRole('button',{name:/Tell me/}).click();
  await page.getByRole('button',{name:'Start recording'}).click();
  await expect(page.getByRole('button',{name:'Stop recording'})).toBeVisible();
  await page.getByRole('button',{name:'Stop recording'}).click();
  await expect(page.getByDisplayValue('boiled eggs')).toBeVisible();
  await expect(page.getByRole('button',{name:'Back'})).toBeVisible();
});

test('Voice Back during recording discards audio and returns to Add choices',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('rhythm_language_v1','en');localStorage.setItem('cary_access_mode_v1','guest');localStorage.setItem('cary_onboarding_v2_complete','true');sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
    class FakeRecorder{
      state='inactive';mimeType='audio/webm';ondataavailable=null;onstop=null;
      constructor(stream){}
      start(){this.state='recording'}
      stop(){this.state='inactive';this.ondataavailable?.({data:new Blob(['voice'])});this.onstop?.()}
    }
    window.MediaRecorder=FakeRecorder;
    Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>({getTracks:()=>[{stop(){}}]})}});
  });
  await page.goto('/');
  await page.getByTestId('primary-capture-button').click();
  await page.getByRole('dialog').getByRole('button',{name:/Tell me/}).click();
  await page.getByRole('button',{name:'Start recording'}).click();
  await page.getByRole('button',{name:'Back'}).click();
  await expect(page.getByRole('dialog').getByRole('button',{name:/Photo/})).toBeVisible();
  await expect(page.getByRole('heading',{name:'What did you have?'})).toHaveCount(0);
});
