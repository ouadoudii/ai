import { expect, test } from '@playwright/test';

for (const viewport of [{name:'mobile',width:390,height:844},{name:'desktop',width:1280,height:900}] as const) {
  for (const scenario of [
    {language:'de',category:'Abendessen',location:'Ort',rating:'Bewertung',body:'Körpersignale',hunger:'Hunger vorher',fullness:'Sättigung danach',energy:'Energie danach',note:'Notiz',share:'Teilen',edit:'Bearbeiten',close:'Schließen',favorite:'Favorit',remove:'Löschen',confirm:/Harira maison.*nicht rückgängig/},
    {language:'fr',category:'Dîner',location:'Lieu',rating:'Évaluation',body:'Signaux du corps',hunger:'Faim avant',fullness:'Satiété après',energy:'Énergie après',note:'Note',share:'Partager',edit:'Modifier',close:'Fermer',favorite:'Favori',remove:'Supprimer',confirm:/Harira maison.*irréversible/},
  ] as const) {
    test(`moment detail uses ${scenario.language} chrome and confirms deletion on ${viewport.name}`, async ({page},testInfo) => {
      await page.setViewportSize(viewport);
      await page.addInitScript(({language}) => {
        const now=new Date(); const date=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
        localStorage.setItem('rhythm_language_v1',language); localStorage.setItem('cary_access_mode_v1','guest'); localStorage.setItem('cary_onboarding_v2_complete','true'); localStorage.setItem('rhythm_voice_entry_seen_v1','true');
        localStorage.setItem('rhythm_intro_profile_v1',JSON.stringify({summary:'Track.',priorities:[],preferences:[],rawIntro:'Track.',confirmedAt:Date.now(),firstPlan:{title:'Observe',rationale:'Notice.',focusAreas:[],firstStep:'Capture.',phase:'evening'}}));
        localStorage.setItem('nimmapp_checkins_v1','[]');
        localStorage.setItem('nimmapp_moments_v1',JSON.stringify([{id:'detail-locale',title:'Harira maison',label:'Dinner',category:'dinner',date,time:'19:15',location:'',imageUrl:'',rating:4,mood:'satisfied',hungerLevel:2,fullnessLevel:4,energyAfter:'energized',notes:'User note محفوظة',tags:[],createdAt:Date.now()}]));
        sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
      },{language:scenario.language});
      await page.goto('/');
      const momentsNav=page.getByTestId('mobile-moments-nav');
      if(await momentsNav.isVisible()) await momentsNav.click(); else await page.getByRole('button',{name:/Momente|Moments|Journal|Entrées|Einträge/i}).first().click();
      await page.getByText('Harira maison').first().click();
      const modal=page.getByTestId('moment-detail-modal');
      await expect(modal.getByTestId('moment-detail-category')).toHaveText(scenario.category);
      await expect(modal.getByText(scenario.location,{exact:true})).toBeVisible();
      await expect(modal.getByText(scenario.rating,{exact:true})).toBeVisible();
      await expect(modal.getByText(scenario.body,{exact:true})).toBeVisible();
      await expect(modal.getByText(scenario.hunger,{exact:true})).toBeVisible();
      await expect(modal.getByText(scenario.fullness,{exact:true})).toBeVisible();
      await expect(modal.getByText(scenario.energy,{exact:true})).toBeVisible();
      await expect(modal.getByText(scenario.note,{exact:true})).toBeVisible();
      await expect(modal.getByRole('button',{name:scenario.close})).toBeVisible();
      await expect(modal.getByRole('button',{name:scenario.favorite})).toBeVisible();
      await expect(modal.getByRole('button',{name:scenario.share})).toBeVisible();
      await expect(modal.getByRole('button',{name:scenario.edit})).toBeVisible();
      await expect(modal.getByRole('button',{name:scenario.remove})).toBeVisible();
      await expect(modal.getByText('User note محفوظة')).toBeVisible();
      page.once('dialog',async dialog=>{expect(dialog.type()).toBe('confirm');expect(dialog.message()).toMatch(scenario.confirm);await dialog.dismiss();});
      await modal.getByRole('button',{name:scenario.remove}).click();
      await expect(modal).toBeVisible();
      await expect(page.getByText('Harira maison').first()).toBeVisible();
      await page.screenshot({path:testInfo.outputPath(`moment-detail-${scenario.language}-${viewport.name}.png`),fullPage:true});
    });
  }
}
