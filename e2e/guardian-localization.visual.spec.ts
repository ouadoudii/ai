import { expect, test } from '@playwright/test';

const profile={summary:'Rhythm',priorities:[],preferences:[],rawIntro:'Rhythm',confirmedAt:1,firstPlan:{title:'Observe',rationale:'Notice',focusAreas:[],firstStep:'Capture',phase:'midday'}};
const labels={
  de:{title:'Cary Fürsorge- & Frühwarn-System',clear:'Keine Intervention erforderlich',test:'Alarm testen',sleep:'Schlafmangel',done:'Als erledigt abhaken'},
  en:{title:'Cary Care & Early Warning System',clear:'No intervention needed',test:'Test alarm',sleep:'Sleep deficit',done:'Mark as handled'},
  fr:{title:'Système de vigilance et d’accompagnement Cary',clear:'Aucune intervention nécessaire',test:'Tester une alerte',sleep:'Manque de sommeil',done:'Marquer comme traité'},
  ar:{title:'نظام كاري للرعاية والإنذار المبكر',clear:'لا حاجة إلى تدخل',test:'اختبار تنبيه',sleep:'نقص النوم',done:'تم التعامل معه'},
} as const;

for(const viewport of [{name:'desktop',width:1280,height:900},{name:'mobile',width:390,height:844}]){
  for(const language of ['de','en','fr','ar'] as const){
    test(`guardian chrome is localized in ${language} on ${viewport.name}`,async({page})=>{
      await page.setViewportSize({width:viewport.width,height:viewport.height});
      await page.addInitScript(({profile,language})=>{
        localStorage.setItem('rhythm_language_v1',language);
        localStorage.setItem('cary_access_mode_v1','guest');
        localStorage.setItem('cary_onboarding_v2_complete','true');
        localStorage.setItem('rhythm_voice_entry_seen_v1','true');
        localStorage.setItem('rhythm_intro_profile_v1',JSON.stringify(profile));
        localStorage.setItem('nimmapp_moments_v1','[]');
        localStorage.setItem('nimmapp_checkins_v1','[]');
        localStorage.removeItem('moment.guardian.acknowledged-occurrences.v1');
        sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
      },{profile,language});
      await page.goto('/');
      await page.getByTestId(viewport.name==='desktop'?'desktop-coach-nav':'mobile-coach-nav').click();
      const guardian=page.getByTestId('guardian');
      await expect(guardian.getByText(labels[language].title)).toBeVisible();
      await expect(guardian.getByText(labels[language].clear)).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('dir',language==='ar'?'rtl':'ltr');
      await guardian.getByRole('button',{name:labels[language].test}).click();
      await guardian.getByRole('button',{name:new RegExp(labels[language].sleep)}).click();
      await expect(guardian.getByRole('button',{name:labels[language].done}).first()).toBeVisible();
    });
  }
}
