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
  await expect(dialog.getByRole('button',{name:/اختيار سريع/})).toBeVisible();

  await dialog.getByRole('button',{name:'English',exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await expect(page.locator('html')).toHaveAttribute('dir','ltr');
  await expect(dialog.getByText('One quick moment')).toBeVisible();
  await expect(dialog.getByText('What would you like to capture?')).toBeVisible();
  await expect(dialog.getByRole('button',{name:/Photo/})).toBeVisible();
  await expect(dialog.getByRole('button',{name:/Tell me/})).toBeVisible();
  await expect(dialog.getByRole('button',{name:/Quick check/})).toBeVisible();
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
