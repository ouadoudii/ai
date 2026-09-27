import { expect, test } from '@playwright/test';

test('quick Voice stops the active recognizer before submitting and ignores late speech', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'de');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    (window as any).__quickVoiceStops = 0;
    class FakeSpeechRecognition {
      continuous = false;
      interimResults = false;
      lang = '';
      onresult: any = null;
      onerror: any = null;
      onend: any = null;
      start() { (window as any).__quickVoiceRecognition = this; }
      stop() { (window as any).__quickVoiceStops += 1; }
      abort() { (window as any).__quickVoiceStops += 1; }
    }
    (window as any).SpeechRecognition = FakeSpeechRecognition;
    (window as any).webkitSpeechRecognition = FakeSpeechRecognition;
  });

  let submitted = '';
  await page.route('**/api/voice-checkin', async route => {
    const body = JSON.parse(route.request().postData() || '{}');
    submitted = body.transcript || '';
    await new Promise(resolve => setTimeout(resolve, 50));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        coachFeedback: { title: 'Erfasst', message: 'Danke', type: 'praise', badge: 'Voice', habitScore: 90 },
        extractedData: { mealDetected: false, mealItems: [], mealTitle: '', mealCategory: '', mealContext: '', meals: [], sleepHours: 0, sleepQuality: 0, wakeFeeling: '', wellbeingEntries: [] }
      })
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: /Sprachaufnahme starten/ }).click();
  await page.evaluate(() => {
    const recognition = (window as any).__quickVoiceRecognition;
    recognition.onresult?.({ resultIndex: 0, results: [[{ transcript: 'Ich hatte Suppe' }]] });
  });

  const input = page.getByPlaceholder(/Oder hier kurz tippen/);
  await expect(input).toHaveValue('Ich hatte Suppe');
  await page.getByRole('button', { name: 'Senden' }).click();

  await expect.poll(() => page.evaluate(() => (window as any).__quickVoiceStops)).toBe(1);
  await expect(page.getByRole('button', { name: /Sprachaufnahme starten/ })).toBeVisible();
  await expect.poll(() => submitted).toBe('Ich hatte Suppe');

  await page.evaluate(() => {
    const recognition = (window as any).__quickVoiceRecognition;
    recognition.onresult?.({ resultIndex: 0, results: [[{ transcript: 'private late speech' }]] });
  });
  await expect(input).toHaveValue('Ich hatte Suppe');
  await page.screenshot({ path: 'test-results/quick-voice-stop-on-send.png', fullPage: true });
});
