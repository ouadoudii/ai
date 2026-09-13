import { expect, test } from '@playwright/test';

type LanguageCase = {
  language: 'de' | 'fr';
  title: string;
  hungry: string;
  full: string;
  next: string;
  energy: string;
  mood: string;
  noWrong: string;
  back: string;
  done: string;
};

const cases: LanguageCase[] = [
  {
    language: 'de',
    title: 'Wie läuft dein Tag?',
    hungry: 'Wie hungrig warst du?',
    full: 'Wie satt hast du dich danach gefühlt?',
    next: 'Noch ein Schritt',
    energy: 'Wie ist deine Energie gerade?',
    mood: 'Was passt gerade am besten?',
    noWrong: 'Es gibt keine richtige oder falsche Antwort. Wir sammeln echte Momente und schauen, was sich mit der Zeit wiederholt.',
    back: 'Zurück',
    done: 'Fertig',
  },
  {
    language: 'fr',
    title: 'Comment se passe ta journée ?',
    hungry: 'À quel point avais-tu faim ?',
    full: 'À quel point étais-tu rassasié après ?',
    next: 'Encore une étape',
    energy: 'Comment est ton énergie maintenant ?',
    mood: 'Qu’est-ce qui te correspond le mieux maintenant ?',
    noWrong: 'Il n’y a pas de bonne ou de mauvaise réponse. Nous recueillons des moments réels pour repérer ce qui se répète avec le temps.',
    back: 'Retour',
    done: 'Terminé',
  },
];

for (const copy of cases) {
  test(`${copy.language} keeps the personal-plan check-in fully localized`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(({ language }) => {
      localStorage.setItem('rhythm_language_v1', language);
      localStorage.setItem('cary_access_mode_v1', 'guest');
      localStorage.setItem('cary_onboarding_v2_complete', 'true');
      localStorage.setItem('rhythm_voice_entry_seen_v1', 'true');
      localStorage.setItem('nimmapp_moments_v1', '[]');
      localStorage.setItem('nimmapp_checkins_v1', '[]');
      localStorage.setItem('rhythm_intro_profile_v1', JSON.stringify({
        summary: 'Profile', priorities: ['meal'], preferences: ['simple'], confirmedAt: Date.now(),
        firstPlan: {
          title: 'Plan', rationale: 'Rationale', focusAreas: ['meal'], firstStep: 'Check in',
          checkInPrompt: 'How are you?', phase: 'midday'
        }
      }));
      sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
    }, { language: copy.language });

    await page.goto('/');
    await page.getByTestId('personal-plan-start').click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: copy.title, exact: true })).toBeVisible();
    await expect(dialog.getByText(copy.hungry, { exact: true })).toBeVisible();
    await expect(dialog.getByText(copy.full, { exact: true })).toBeVisible();
    await expect(dialog.getByRole('button', { name: copy.next, exact: true })).toBeVisible();

    await dialog.getByRole('button', { name: copy.next, exact: true }).click();
    await expect(dialog.getByText(copy.energy, { exact: true })).toBeVisible();
    await expect(dialog.getByText(copy.mood, { exact: true })).toBeVisible();
    await expect(dialog.getByText(copy.noWrong, { exact: true })).toBeVisible();
    await expect(dialog.getByRole('button', { name: copy.back, exact: true })).toBeVisible();
    await expect(dialog.getByRole('button', { name: copy.done, exact: true })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`daily-checkin-${copy.language}.png`), fullPage: true });
  });
}
