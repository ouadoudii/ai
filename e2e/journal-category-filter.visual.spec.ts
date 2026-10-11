import { test, expect } from '@playwright/test';

const moments = [
  {id:'breakfast',title:'بيض مسلوق',label:'Meal',category:'breakfast',date:'2026-09-30',time:'08:00',location:'Home',imageUrl:'',rating:5,mood:'satisfied',tags:['morning'],createdAt:1,isFavorite:true},
  {id:'dinner',title:'حريرة Harira',label:'Meal',category:'dinner',date:'2026-09-29',time:'19:00',location:'Marrakech',imageUrl:'',rating:5,mood:'comfort',tags:['morocco'],createdAt:2,isFavorite:false}
];

const prepare = async (page:any) => page.addInitScript((seedMoments) => {
  localStorage.setItem('rhythm_language_v1','de');
  localStorage.setItem('cary_access_mode_v1','guest');
  localStorage.setItem('cary_onboarding_v2_complete','true');
  localStorage.setItem('rhythm_voice_entry_seen_v1','true');
  localStorage.setItem('nimmapp_moments_v1',JSON.stringify(seedMoments));
  localStorage.setItem('nimmapp_checkins_v1','[]');
  sessionStorage.setItem('nimmapp_checkin_auto_opened','true');
}, moments);

const openTimeline = async (page:any,mobile:boolean) => mobile
  ? page.getByTestId('mobile-moments-nav').click()
  : page.getByRole('button',{name:'Momente',exact:true}).click();

for (const viewport of [{ name: 'desktop', width: 1280, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
  test(`journal category filter is visible and filters real history on ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await prepare(page);
    await page.goto('/');
    await openTimeline(page, viewport.name === 'mobile');

    await expect(page.getByTestId('moments-timeline')).toBeVisible();
    await expect(page.getByTestId('timeline-category-filters')).toBeVisible();
    await expect(page.getByTestId('timeline-moment-breakfast')).toBeVisible();
    await expect(page.getByTestId('timeline-moment-dinner')).toBeVisible();

    const breakfast = page.getByTestId('timeline-category-breakfast');
    await breakfast.click();
    await expect(breakfast).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('timeline-category-all')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByTestId('timeline-moment-breakfast')).toBeVisible();
    await expect(page.getByTestId('timeline-moment-dinner')).toHaveCount(0);

    await page.screenshot({ path: testInfo.outputPath(`journal-category-filter-${viewport.name}.png`), fullPage: true });
  });
}
