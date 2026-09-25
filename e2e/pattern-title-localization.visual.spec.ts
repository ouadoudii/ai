import { expect, test } from '@playwright/test';

const moments = [
  { id:'late-lunch-a', title:'Lunch A', category:'lunch', date:'2026-09-21', time:'14:15', createdAt:1 },
  { id:'evening-snack-a', title:'Snack A', category:'snack', date:'2026-09-21', time:'19:00', createdAt:2 },
  { id:'late-lunch-b', title:'Lunch B', category:'lunch', date:'2026-09-22', time:'14:30', createdAt:3 },
  { id:'evening-snack-b', title:'Snack B', category:'snack', date:'2026-09-22', time:'20:00', createdAt:4 },
  { id:'late-lunch-c', title:'Lunch C', category:'lunch', date:'2026-09-23', time:'15:00', createdAt:5 },
];

const copies = [
  { language:'en', languageButton:'Choose language', title:'Late lunch ↔ evening snacking' },
  { language:'de', languageButton:'Sprache wählen', title:'Spätes Mittagessen und Snacks am Abend' },
  { language:'fr', languageButton:'Choisir la langue', title:'Déjeuner tardif et grignotage le soir' },
  { language:'ar', languageButton:'اختر اللغة', title:'الغداء المتأخر والوجبات الخفيفة مساءً' },
] as const;

test('late-lunch pattern title follows real language switching without English fallback', async ({ page }, testInfo) => {
  await page.setViewportSize({ width:390, height:844 });
  await page.addInitScript(({ seedMoments }) => {
    localStorage.setItem('rhythm_language_v1', 'en');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify({
      summary:'Track my rhythm.', priorities:[], preferences:[], rawIntro:'Track my rhythm.', confirmedAt:Date.now(),
      firstPlan:{ title:'Observe', rationale:'Notice patterns.', focusAreas:[], firstStep:'Capture the next check-in.', phase:'midday' },
    }));
    localStorage.setItem('nimmapp_moments_v1', JSON.stringify(seedMoments));
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  }, { seedMoments: moments });

  await page.goto('/');
  await page.getByRole('button', { name:'Discoveries', exact:true }).click();
  await expect(page.getByRole('heading', { name:copies[0].title, exact:true })).toBeVisible();

  let current = copies[0];
  for (const next of copies.slice(1)) {
    await page.getByRole('button', { name:current.languageButton, exact:true }).click();
    await page.locator(`[data-language-option="${next.language}"]`).click();
    await expect(page.locator('html')).toHaveAttribute('lang', next.language);
    await expect(page.getByRole('heading', { name:next.title, exact:true })).toBeVisible();
    await expect(page.getByRole('heading', { name:copies[0].title, exact:true })).toHaveCount(next.language === 'en' ? 1 : 0);
    await page.screenshot({ path:testInfo.outputPath(`late-lunch-pattern-${next.language}.png`), fullPage:true });
    current = next;
  }
});
