import {test,expect} from '@playwright/test';
import {captureFullPageStrict} from './support/strictScreenshot';

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
  await captureFullPageStrict(page,{path:testInfo.outputPath('01-account-choice.png')});

  await page.getByRole('button',{name:/ابدأ على هذا الجهاز/}).click();
  await expect(page.getByRole('button',{name:/ابدأ اليوم|ابدأ/})).toBeVisible();
  await captureFullPageStrict(page,{path:testInfo.outputPath('02-onboarding.png')});

  await page.getByRole('button',{name:/ابدأ اليوم|ابدأ/}).click();
  await expect(page.getByText(/مرحباً بك/)).toBeVisible();
  await captureFullPageStrict(page,{path:testInfo.outputPath('03-home-after-onboarding.png')});
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
    await captureFullPageStrict(page,{path:testInfo.outputPath(`${country}-01-home.png`)});

    await openCapture(page);
    await expect(page.locator('html')).toHaveAttribute('lang','ar');
    await expect(page.locator('html')).toHaveAttribute('dir','rtl');
    const captureDialog=page.getByRole('dialog');
    await expect(captureDialog.locator('[data-language-option]')).toHaveCount(0);
    await expect(captureDialog.getByRole('button',{name:/English|Deutsch|Français/})).toHaveCount(0);
    await captureFullPageStrict(page,{path:testInfo.outputPath(`${country}-02-capture.png`)});

    await expect(captureDialog).toBeVisible();
    const photoButton=captureDialog.getByRole('button',{name:/صورة/});
    await expect(photoButton).toBeVisible();
    await photoButton.click();

    await expect(page.getByRole('heading',{name:/ماذا أكلت؟/})).toBeVisible();
    const foodSearch=page.getByPlaceholder(/ابدأ بالكتابة/);
    await expect(foodSearch).toBeVisible();
    await foodSearch.fill('بيض');
    await expect(page.getByTestId('recognized-food-alias')).toContainText('بيض');
    await captureFullPageStrict(page,{path:testInfo.outputPath(`${country}-03-food-picker.png`)});
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
  await expect(page.getByTestId('food-visual-pasta')).toHaveAttribute('aria-pressed','true');
  await page.getByTestId('food-visual-pasta').click();
  await expect(page.getByTestId('food-visual-pasta')).toHaveAttribute('aria-pressed','false');
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
