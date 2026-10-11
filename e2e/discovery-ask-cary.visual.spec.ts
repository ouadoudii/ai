import { test, expect } from '@playwright/test';

const moments = [
  { id:'l1', title:'Lunch A', category:'lunch', date:'2026-09-21', time:'14:15', createdAt:1 },
  { id:'s1', title:'Snack A', category:'snack', date:'2026-09-21', time:'19:00', createdAt:2 },
  { id:'l2', title:'Lunch B', category:'lunch', date:'2026-09-22', time:'14:30', createdAt:3 },
  { id:'s2', title:'Snack B', category:'snack', date:'2026-09-22', time:'20:00', createdAt:4 },
  { id:'l3', title:'Lunch C', category:'lunch', date:'2026-09-23', time:'15:00', createdAt:5 },
];

test('Discovery to Cary prefill stays unsent on desktop', async ({ page }, testInfo) => {
  await page.setViewportSize({ width:1280, height:900 });
  await page.addInitScript((seed) => {
    localStorage.setItem('nimmapp_moments_v1', JSON.stringify(seed));
    localStorage.setItem('rhythm_language_v1', 'en');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
  }, moments);
  await page.goto('/');
  await page.getByRole('button', { name:'Discoveries', exact:true }).click();
  const card = page.locator('[data-pattern-id="late-lunch-snacking"]');
  const evidence = await card.getByTestId('pattern-evidence').innerText();
  await card.getByTestId('ask-cary-late-lunch-snacking').click();
  const composer = page.getByTestId('cary-chat-composer');
  const draft = await composer.inputValue();
  expect(draft).toContain(evidence.trim());
  await expect(page.getByText(draft, { exact:true })).toHaveCount(0);
  await page.screenshot({ path:testInfo.outputPath('discovery-ask-cary-desktop.png'), fullPage:true });
});

test('Discovery to Cary prefill stays unsent on mobile Arabic', async ({ page }, testInfo) => {
  await page.setViewportSize({ width:390, height:844 });
  await page.addInitScript((seed) => {
    localStorage.setItem('nimmapp_moments_v1', JSON.stringify(seed));
    localStorage.setItem('rhythm_language_v1', 'ar');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
  }, moments);
  await page.goto('/');
  await page.getByRole('button', { name:'اكتشافاتك', exact:true }).click();
  const card = page.locator('[data-pattern-id="late-lunch-snacking"]');
  const evidence = await card.getByTestId('pattern-evidence').innerText();
  await expect(card.getByTestId('ask-cary-late-lunch-snacking')).toHaveText('اسأل كاري');
  await card.getByTestId('ask-cary-late-lunch-snacking').click();
  const composer = page.getByTestId('cary-chat-composer');
  const draft = await composer.inputValue();
  expect(draft).toContain('ساعدني على فهم هذا النمط الشخصي:');
  expect(draft).toContain(evidence.trim());
  await expect(page.getByText(draft, { exact:true })).toHaveCount(0);
  await composer.fill(draft + ' تفاصيل أكثر');
  await expect(composer).toHaveValue(draft + ' تفاصيل أكثر');
  await page.screenshot({ path:testInfo.outputPath('discovery-ask-cary-mobile.png'), fullPage:true });
});
