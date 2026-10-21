import { devices, expect, test, type Browser, type Page, type Route } from '@playwright/test';

// Runs real desktop and mobile browser contexts even when the CI project is mobile-only.
type DeviceCase = 'desktop' | 'mobile';
type Language = 'en' | 'de' | 'fr' | 'ar';
const cases: DeviceCase[] = ['desktop', 'mobile'];

async function openHarness(browser: Browser, device: DeviceCase, language: Language, transcripts: string[]) {
  const context = await browser.newContext({
    ...devices[device === 'desktop' ? 'Desktop Chrome' : 'Pixel 7'],
    baseURL: 'http://127.0.0.1:4173',
  });
  const page = await context.newPage();
  await page.addInitScript(({ language, transcripts }) => {
    localStorage.setItem('rhythm_language_v1', language);
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
    localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify({
      summary: 'Returning user', priorities: [], preferences: [], rawIntro: 'Returning user',
      firstPlan: { title: 'A small step', rationale: 'A small step', focusAreas: [],
        firstStep: 'Start with a moment.', phase: 'midday' }, confirmedAt: 1,
    }));
    if (localStorage.getItem('nimmapp_moments_v1') === null) localStorage.setItem('nimmapp_moments_v1', '[]');
    if (localStorage.getItem('nimmapp_checkins_v1') === null) localStorage.setItem('nimmapp_checkins_v1', '[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');

    const queue = [...transcripts];
    class FakeSpeechRecognition {
      lang = ''; interimResults = false; continuous = false;
      onresult: ((event: unknown) => void) | null = null;
      onend: (() => void) | null = null;
      private active = false;
      start() { this.active = true; }
      stop() {
        // The browser emits a final result/end only once. App cleanup may call
        // stop() again after the modal closes; that must not eat Voice B's transcript.
        if (!this.active) return;
        this.active = false;
        const result = Object.assign([{ transcript: queue.shift() || '' }], { isFinal: true });
        this.onresult?.({ resultIndex: 0, results: [result] });
        this.onend?.();
      }
    }
    (window as any).SpeechRecognition = FakeSpeechRecognition;
    (window as any).webkitSpeechRecognition = FakeSpeechRecognition;
    // Arabic deliberately takes the microphone -> server transcription path.
    class FakeRecorder {
      state = 'inactive'; mimeType = 'audio/webm';
      ondataavailable: ((event: { data: Blob }) => void) | null = null;
      onstop: (() => void) | null = null;
      constructor(_stream: MediaStream) {}
      start() { this.state = 'recording'; }
      stop() {
        this.state = 'inactive';
        this.ondataavailable?.({ data: new Blob(['speech'], { type: 'audio/webm' }) });
        this.onstop?.();
      }
    }
    (window as any).MediaRecorder = FakeRecorder;
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] }) },
    });
    (window as any).__nextTranscription = () => queue.shift() || '';
  }, { language, transcripts });
  await page.route('**/api/transcribe-audio', async route => {
    const text = await page.evaluate(() => (window as any).__nextTranscription());
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ text }) });
  });
  await page.goto('/');
  return { page, context };
}

async function capture(page: Page, device: DeviceCase) {
  await page.getByTestId(device === 'desktop' ? 'desktop-capture-button' : 'primary-capture-button').click();
  await page.locator('[data-capture-method="voice"]').click();
  // The product UI is Arabic-only even when a persisted legacy locale exists.
  // `language` still selects the transcript transport exercised by this harness.
  await page.getByRole('button', { name: 'ابدأ التسجيل' }).click();
  await page.getByRole('button', { name: 'إيقاف التسجيل' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
}

async function startText(page: Page, device: DeviceCase) {
  await page.getByTestId(device === 'desktop' ? 'desktop-capture-button' : 'primary-capture-button').click();
  await page.locator('[data-capture-method="text"]').click();
  const input = page.locator('input[autocomplete="off"]');
  await expect(input).toBeVisible();
  return input;
}

const feedback = { title: 'Done', message: 'Recorded', type: 'praise', badge: 'Voice', habitScore: 90 };
function journal(title: string) {
  return {
    coachFeedback: feedback,
    extractedData: {
      mealDetected: true, mealItems: [title], mealTitle: title, mealCategory: 'lunch', mealContext: '',
      meals: [{ category: 'lunch', timeOfDay: 'midday', time: '', mealTitle: title,
        mealItems: [title], hungerBefore: 0, fullnessAfter: 0 }],
      sleepHours: 0, sleepQuality: 0, wakeFeeling: '', wellbeingEntries: [],
    },
  };
}
function clarification(title: string) {
  return { coachFeedback: feedback, extractedData: {
    mealItems: [title], mealTitle: title, mealCategory: 'lunch',
    mealContext: 'stale context', clarificationQuestion: 'How much?', meals: [], wellbeingEntries: [],
  } };
}
const emptyResult = { coachFeedback: feedback, extractedData: {
  mealItems: [], mealTitle: '', mealCategory: '', mealContext: '', meals: [], wellbeingEntries: [],
} };
async function fulfill(route: Route, result: unknown) {
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(result) });
}
async function titles(page: Page): Promise<string[]> {
  return page.evaluate(() => JSON.parse(localStorage.getItem('nimmapp_moments_v1') || '[]').map((m: {title: string}) => m.title));
}

for (const device of cases) {
  test(`#234 ${device}: stale clarification and journal result cannot overwrite a newer text draft`, async ({ browser }) => {
    const { page, context } = await openHarness(browser, device, 'en', ['Old voice couscous']);
    try {
      const pending: Route[] = [];
      await page.route('**/api/voice-checkin', route => { pending.push(route); });
      await capture(page, device);
      await expect.poll(() => pending.length).toBe(1);
      const draft = await startText(page, device);
      await draft.fill('Fresh meal B - untouched');
      await fulfill(pending[0], clarification('stale couscous'));
      await expect(draft).toHaveValue('Fresh meal B - untouched');
      await expect(page.getByTestId('meal-clarification-card')).toHaveCount(0);
      await expect(page.getByTestId('voice-understanding-card')).toHaveCount(0);
      expect(await titles(page)).toEqual([]);
      await page.reload();
      expect(await titles(page)).toEqual([]);
    } finally { await context.close(); }
  });

  for (const order of ['A then B', 'B then A'] as const) {
    test(`#234 ${device}: newer Voice B wins when AI resolves ${order}`, async ({ browser }) => {
      const { page, context } = await openHarness(browser, device, 'de', [
        'Ich habe alten Couscous gegessen.', 'I had fresh salad. بغيت سلطة.',
      ]);
      try {
        const pending: Route[] = [];
        await page.route('**/api/voice-checkin', route => { pending.push(route); });
        await capture(page, device);
        await expect.poll(() => pending.length).toBe(1);
        await capture(page, device);
        await expect.poll(() => pending.length).toBe(2);
        if (order === 'A then B') {
          await fulfill(pending[0], journal('old-couscous-A'));
          await fulfill(pending[1], journal('fresh-salad-B'));
        } else {
          await fulfill(pending[1], journal('fresh-salad-B'));
          await expect.poll(async () => (await titles(page)).includes('fresh-salad-B')).toBe(true);
          await fulfill(pending[0], journal('old-couscous-A'));
        }
        await expect.poll(async () => await titles(page)).toEqual(['fresh-salad-B']);
        await page.reload();
        expect(await titles(page)).toEqual(['fresh-salad-B']);
      } finally { await context.close(); }
    });
  }

  test(`#234 ${device}: late profile-intent result cannot hijack a newer text draft`, async ({ browser }) => {
    const { page, context } = await openHarness(browser, device, 'en', ['I want a healthier routine']);
    try {
      await page.route('**/api/voice-checkin', route => fulfill(route, emptyResult));
      const intents: Route[] = [];
      await page.route('**/api/voice-intent', route => { intents.push(route); });
      await capture(page, device);
      await expect.poll(() => intents.length).toBe(1);
      const draft = await startText(page, device);
      await draft.fill('New meal after intent request');
      await fulfill(intents[0], { intent: 'profile_goal', confidence: .99 });
      await expect(draft).toHaveValue('New meal after intent request');
      await expect(page.getByTestId('profile-intro-modal')).toHaveCount(0);
      expect(await titles(page)).toEqual([]);
    } finally { await context.close(); }
  });
}

test('#234 mobile Arabic transcription A cannot replace an English/mixed-language correction B', async ({ browser }) => {
  const { page, context } = await openHarness(browser, 'mobile', 'ar', ['كسكس قديم', 'سلطة جديدة']);
  try {
    const pending: Route[] = [];
    await page.route('**/api/voice-checkin', route => { pending.push(route); });
    await capture(page, 'mobile');
    await expect.poll(() => pending.length).toBe(1);
    await capture(page, 'mobile');
    await expect.poll(() => pending.length).toBe(2);
    await fulfill(pending[1], journal('سلطة جديدة'));
    await expect.poll(async () => await titles(page)).toEqual(['سلطة جديدة']);
    await fulfill(pending[0], journal('كسكس قديم'));
    await expect.poll(async () => await titles(page)).toEqual(['سلطة جديدة']);
    await page.reload();
    expect(await titles(page)).toEqual(['سلطة جديدة']);
  } finally { await context.close(); }
});

test('#234 mobile: navigating to Timeline abandons pending Voice before fallback can open', async ({ browser }) => {
  const { page, context } = await openHarness(browser, 'mobile', 'en', ['An older unrelated message']);
  try {
    const pending: Route[] = [];
    await page.route('**/api/voice-checkin', route => { pending.push(route); });
    await capture(page, 'mobile');
    await expect.poll(() => pending.length).toBe(1);
    await page.getByTestId('mobile-moments-nav').click();
    await expect(page.getByRole('heading', { name: 'اليوميات والتسلسل الزمني' })).toBeVisible();
    await fulfill(pending[0], clarification('old fallback'));
    await expect(page.getByRole('heading', { name: 'اليوميات والتسلسل الزمني' })).toBeVisible();
    await expect(page.getByTestId('voice-understanding-card')).toHaveCount(0);
    await expect(page.getByTestId('meal-clarification-card')).toHaveCount(0);
    expect(await titles(page)).toEqual([]);
  } finally { await context.close(); }
});
