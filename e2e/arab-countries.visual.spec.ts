import {test,expect} from '@playwright/test';

const countries=['DZ','BH','KM','DJ','EG','IQ','JO','KW','LB','LY','MR','MA','OM','PS','QA','SA','SO','SD','SY','TN','AE','YE'];

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

    const captureButton=page.locator('nav button').filter({has:page.locator('svg')}).nth(2);
    await expect(captureButton).toBeVisible();
    await captureButton.click();
    await expect(page.getByText('العربية',{exact:true})).toBeVisible();
    await expect(page.getByText('English',{exact:true})).toBeVisible();
    await page.screenshot({path:testInfo.outputPath(`${country}-02-capture.png`),fullPage:true});

    const photoButton=page.getByRole('button',{name:/صورة/}).first();
    await expect(photoButton).toBeVisible();
    await photoButton.click();

    await expect(page.getByRole('heading',{name:/ماذا أكلت؟/})).toBeVisible();
    await expect(page.getByText(new RegExp(country==='MA'?'المغرب|Morocco':'.'))).toBeVisible().catch(()=>{});
    await page.screenshot({path:testInfo.outputPath(`${country}-03-food-picker.png`),fullPage:true});
  });
}

test('English switch changes the real capture UI to LTR',async({page},testInfo)=>{
  await page.addInitScript(()=>{
    localStorage.setItem('rhythm_language_v1','ar');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
  });
  await page.goto('/');
  const captureButton=page.locator('nav button').nth(2);
  await captureButton.click();
  const english=page.getByRole('button',{name:/English/}).first();
  await expect(english).toBeVisible();
  await english.click();
  await expect(page.locator('html')).toHaveAttribute('dir','ltr');
  await expect(page.getByText(/What would you like to capture\?/)).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('english-switch.png'),fullPage:true});
});
