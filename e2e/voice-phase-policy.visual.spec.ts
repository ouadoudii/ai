import { expect, test } from '@playwright/test';

test('voice capture remains available under the shared Today phase policy', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'en');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  });

  await page.goto('/');
  await page.getByRole('button',{name:'سجّل لحظة',exact:true}).filter({visible:true}).first().click();

  const captureDialog = page.getByRole('dialog');
  await expect(captureDialog).toBeVisible();

  const tellButton = captureDialog.getByRole('button', { name: 'احكِ لي', exact: true });
  await expect(tellButton).toBeVisible();
  await expect(tellButton).toBeEnabled();
  await tellButton.click();
  const voiceDialog = page.getByRole('dialog');
  await expect(voiceDialog).toBeVisible();
  await expect(voiceDialog.getByRole('button', { name: 'ابدأ التسجيل', exact: true })).toBeVisible();

  await page.screenshot({ path: 'visual-artifacts/voice-phase-policy.png', fullPage: true });
});
