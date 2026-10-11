import {expect,test,type Page} from '@playwright/test';

// The worker is intentionally deferred: photo A must never write into a later
// editor session or into a new category after the user has reset the context.
async function prepare(page:Page){
  await page.addInitScript(()=>{
    localStorage.setItem('rhythm_language_v1','en');
    localStorage.setItem('cary_access_mode_v1','guest');
    localStorage.setItem('cary_onboarding_v2_complete','true');
    localStorage.setItem('rhythm_intro_profile_v1',JSON.stringify({displayName:'Test',completedAt:new Date().toISOString()}));
    localStorage.setItem('rhythm_voice_entry_seen_v1','true');
    localStorage.setItem('nimmapp_moments_v1','[]');
    localStorage.setItem('nimmapp_checkins_v1','[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
    const pending:{id:number;worker:FakeWorker}[]=[];
    class FakeWorker {
      onmessage:((event:{data:unknown})=>void)|null=null;
      onerror:((event:unknown)=>void)|null=null;
      postMessage(message:{id:number;type:string}){
        if(message.type==='image')pending.push({id:message.id,worker:this});
      }
      terminate(){}
    }
    (window as any).__photoPending=()=>pending.length;
    (window as any).__resolvePhoto=(index:number,label:string)=>{
      const request=pending[index];
      if(!request)throw new Error('Missing pending photo request '+index);
      request.worker.onmessage?.({data:{id:request.id,results:[{label,score:0.99}]}});
    };
    Object.defineProperty(window,'Worker',{configurable:true,writable:true,value:FakeWorker});
  });
  await page.goto('/');
}

async function openEditor(page:Page,mobile:boolean,method:'photo'|'text'){
  const add=mobile?page.getByTestId('primary-capture-button'):
    page.getByRole('button',{name:'Add a moment',exact:true}).filter({visible:true}).first();
  await expect(add).toBeVisible();
  await add.click();
  await page.locator('[data-capture-method="'+method+'"]').click();
  await expect(page.locator('input[autocomplete="off"]')).toBeVisible();
}

async function upload(page:Page){
  await page.locator('input[type="file"][accept="image/*"]').setInputFiles({
    name:'photo-a.png',mimeType:'image/png',
    buffer:Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]),
  });
  await expect.poll(()=>page.evaluate(()=>(window as any).__photoPending())).toBe(1);
}

for(const viewport of [
  {name:'desktop',width:1280,height:900,mobile:false},
  {name:'mobile',width:390,height:844,mobile:true},
]){
  test('canceled photo A cannot overwrite a reopened text meal B ('+viewport.name+')',async({page},testInfo)=>{
    await page.setViewportSize({width:viewport.width,height:viewport.height});
    await prepare(page);
    await openEditor(page,viewport.mobile,'photo');
    await upload(page);
    await page.getByRole('button',{name:'Close',exact:true}).last().click();
    await openEditor(page,viewport.mobile,'text');
    const input=page.locator('input[autocomplete="off"]');
    await input.fill('unrelated vegetable soup');
    await page.evaluate(()=>(window as any).__resolvePhoto(0,'pizza'));
    await expect(input).toHaveValue('unrelated vegetable soup');
    await expect(page.getByTestId('photo-recognition-suggestions')).toHaveCount(0);
    await page.screenshot({path:testInfo.outputPath('photo-race-reopen-'+viewport.name+'.png'),fullPage:true});
  });

  test('category reset invalidates the pending photo result ('+viewport.name+')',async({page},testInfo)=>{
    await page.setViewportSize({width:viewport.width,height:viewport.height});
    await prepare(page);
    await openEditor(page,viewport.mobile,'photo');
    await upload(page);
    await page.getByRole('button',{name:'Coffee',exact:true}).last().click();
    const input=page.locator('input[autocomplete="off"]');
    await input.fill('fresh mint tea');
    await page.evaluate(()=>(window as any).__resolvePhoto(0,'pizza'));
    await expect(input).toHaveValue('fresh mint tea');
    await expect(page.getByTestId('photo-recognition-suggestions')).toHaveCount(0);
    await page.screenshot({path:testInfo.outputPath('photo-race-category-'+viewport.name+'.png'),fullPage:true});
  });
}
