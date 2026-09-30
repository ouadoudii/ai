import { expect, test } from '@playwright/test';

const realMoment={id:'moment-user-export',title:'بيض مسلوق + pain complet',label:'Breakfast',category:'breakfast',date:'2026-09-30',time:'08:15',location:'Home',locationCategory:'home',imageUrl:'',rating:5,mood:'satisfied',hungerLevel:3,fullnessLevel:4,eatingPace:'normal',distraction:'none',energyAfter:'neutral',coachFeedback:{title:'Saved',message:'ok',type:'praise'},notes:'Kaffee بلا سكر',tags:[],createdAt:1};
const demoMoment={...realMoment,id:'moment-1',title:'DEMO'};

async function seed(page:any){await page.addInitScript(({realMoment,demoMoment})=>{localStorage.setItem('nimmapp_moments_v1',JSON.stringify([realMoment,demoMoment]));localStorage.setItem('nimmapp_checkins_v1','[]');localStorage.setItem('moment_voice_first_entry_seen_v1','true');},{realMoment,demoMoment});}

for(const project of [{name:'desktop',mobile:false},{name:'mobile',mobile:true}]){
  test(`${project.name}: downloads private multilingual Moment backup`,async({page})=>{
    await seed(page);
    await page.goto('/');
    if(project.mobile){await page.getByRole('button',{name:/language|sprache|langue|اللغة/i}).last().click();}
    else{await page.getByRole('button',{name:/choose language|sprache wählen|choisir|اختر/i}).click();}
    const button=page.getByTestId('personal-data-export');
    await expect(button).toBeVisible();
    const downloadPromise=page.waitForEvent('download');
    await button.click();
    const download=await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^moment-data-\d{4}-\d{2}-\d{2}\.json$/);
    const path=await download.path();
    expect(path).toBeTruthy();
    const text=await (await import('node:fs/promises')).readFile(path!,'utf8');
    const payload=JSON.parse(text);
    expect(payload.schemaVersion).toBe(1);
    expect(payload.moments).toHaveLength(1);
    expect(payload.moments[0].title).toBe('بيض مسلوق + pain complet');
    expect(payload.moments[0].notes).toBe('Kaffee بلا سكر');
    expect(text).not.toContain('DEMO');
    await page.screenshot({path:`test-results/personal-data-export-${project.name}.png`,fullPage:true});
  });
}
