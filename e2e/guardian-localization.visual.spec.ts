import { expect, test } from '@playwright/test';

const profile={summary:'Rhythm',priorities:[],preferences:[],rawIntro:'Rhythm',confirmedAt:1,firstPlan:{title:'Observe',rationale:'Notice',focusAreas:[],firstStep:'Capture',phase:'midday'}};
const labels={
  de:{title:'Moment Fürsorge- & Frühwarn-System',clear:'Keine Intervention erforderlich',test:'Alarm testen',sleep:'Schlafmangel',done:'Als erledigt abhaken'},
  en:{title:'Moment Care & Early Warning System',clear:'No intervention needed',test:'Test alarm',sleep:'Sleep deficit',done:'Mark as handled'},
  fr:{title:'Système de vigilance et d’accompagnement Moment',clear:'Aucune intervention nécessaire',test:'Tester une alerte',sleep:'Manque de sommeil',done:'Marquer comme traité'},
  ar:{title:'مساحة لطيفة للاهتمام بنفسك',clear:'هنا متى احتجت',test:'اختبار تنبيه',sleep:'نقص النوم',done:'إخفاء الفكرة'},
} as const;

for(const viewport of [{name:'desktop',width:1280,height:900},{name:'mobile',width:390,height:844}]){
  for(const language of ['de','en','fr','ar'] as const){
    test(`legacy ${language} renders Arabic guardian chrome on ${viewport.name}`,async({page})=>{
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
      await expect(guardian.getByText(labels.ar.title)).toBeVisible();
      await expect(guardian.getByText(labels.ar.clear)).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('dir','rtl');
      await guardian.getByRole('button',{name:labels.ar.test}).click();
      await guardian.getByRole('button',{name:new RegExp(labels.ar.sleep)}).click();
      await expect(guardian.getByRole('button',{name:new RegExp(labels.ar.done)}).first()).toBeVisible();
      await expect(guardian.getByText('قد تحتاج إلى بعض الراحة اليوم')).toBeVisible();
      await expect(guardian.locator('.animate-pulse, .animate-ping')).toHaveCount(0);
      await expect(guardian.getByText('نمط الأكل الحدسي')).toHaveCount(0);
      await expect(guardian.getByRole('status')).toContainText('أفكار يمكنك تجاهلها');
      await expect(guardian.locator('[class*="bg-rose"], [class*="text-rose"]')).toHaveCount(0);
      await expect(guardian).not.toContainText(/Ghrelin|Ghrelin-Hoch|Küchenschluss|Überessen|28%|Akute Intervention|Heißhunger/);
    });
  }
}
