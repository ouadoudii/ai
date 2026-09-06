import {test,expect} from '@playwright/test';
const countries=['DZ','BH','KM','DJ','EG','IQ','JO','KW','LB','LY','MR','MA','OM','PS','QA','SA','SO','SD','SY','TN','AE','YE'];

for(const country of countries){
  test(`${country} Arabic mobile visual journey`,async({page},testInfo)=>{
    await page.addInitScript(({country})=>{
      localStorage.setItem('rhythm_language_v1','ar');
      localStorage.setItem('rhythm_country_v1',country);
    },{country});
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('dir','rtl');
    await expect(page.locator('body')).toBeVisible();
    await page.screenshot({path:testInfo.outputPath(`${country}-home.png`),fullPage:true});

    const add=page.getByRole('button',{name:/إضافة|أضف|Add/i}).first();
    if(await add.isVisible().catch(()=>false)){
      await add.click();
      await page.waitForTimeout(250);
      await page.screenshot({path:testInfo.outputPath(`${country}-capture.png`),fullPage:true});
      await expect(page.getByText('English',{exact:true})).toBeVisible();
      await expect(page.getByText('العربية',{exact:true})).toBeVisible();
    }
  });
}

test('English switch removes Arabic-only shell direction',async({page},testInfo)=>{
  await page.addInitScript(()=>localStorage.setItem('rhythm_language_v1','ar'));
  await page.goto('/');
  const add=page.getByRole('button',{name:/إضافة|أضف/i}).first();
  if(await add.isVisible().catch(()=>false)) await add.click();
  const english=page.getByRole('button',{name:/English/}).first();
  await expect(english).toBeVisible();
  await english.click();
  await expect(page.locator('html')).toHaveAttribute('dir','ltr');
  await page.screenshot({path:testInfo.outputPath('english-switch.png'),fullPage:true});
});
