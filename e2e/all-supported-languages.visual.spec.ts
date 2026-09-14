import { expect, test } from '@playwright/test';

type AppLanguage = 'en' | 'ar' | 'de' | 'fr';

const cases: Array<{
  language: AppLanguage;
  dir: 'ltr' | 'rtl';
  today: string;
  discoveries: string;
  moments: string;
  chooseLanguage: string;
  homeHeading: string;
  captureDay: string;
  recentMoments: string;
  captureTitle: string;
  photo: string;
  speak: string;
  foodLabel: string;
  foodTitle: string;
  mealPlaceholder: string;
  chooseByPicture: string;
  pictureHelp: string;
  photoSection: string;
  addPhoto: string;
  addNote: string;
  saveMeal: string;
  footer: string;
  close: string;
}> = [
  {
    language: 'en', dir: 'ltr', today: 'Today', discoveries: 'Discoveries', moments: 'My moments',
    chooseLanguage: 'Choose language', homeHeading: 'Welcome back 👋', captureDay: 'Capture your day', recentMoments: 'Your recent moments',
    captureTitle: 'What would you like to capture?', photo: 'Photo', speak: 'Tell me',
    foodLabel: 'Food', foodTitle: 'What did you have?', mealPlaceholder: 'Start typing… e.g. chicken pasta',
    chooseByPicture: 'Choose by picture', pictureHelp: 'Or start typing to narrow the choices', photoSection: 'Photo', addPhoto: 'Add your photo',
    addNote: 'Add a note', saveMeal: 'Save meal', footer: 'Type a little — we’ll help with the rest.', close: 'Close',
  },
  {
    language: 'ar', dir: 'rtl', today: 'اليوم', discoveries: 'اكتشافاتك', moments: 'لحظاتي',
    chooseLanguage: 'اختر اللغة', homeHeading: 'مرحباً بك 👋', captureDay: 'سجّل يومك', recentMoments: 'لحظاتك الأخيرة',
    captureTitle: 'ما اللحظة التي تريد تسجيلها؟', photo: 'صورة', speak: 'احكِ لي',
    foodLabel: 'الطعام', foodTitle: 'ماذا أكلت؟', mealPlaceholder: 'ابدأ بالكتابة… مثلاً طاجين',
    chooseByPicture: 'اختر بالصورة', pictureHelp: 'أو ابدأ بالكتابة لتضييق الاختيارات', photoSection: 'الصورة', addPhoto: 'أضف صورتك',
    addNote: 'أضف ملاحظة', saveMeal: 'حفظ الوجبة', footer: 'اكتب القليل فقط — سنساعدك في الباقي.', close: 'إغلاق',
  },
  {
    language: 'de', dir: 'ltr', today: 'Heute', discoveries: 'Entdeckungen', moments: 'Meine Momente',
    chooseLanguage: 'Sprache wählen', homeHeading: 'Willkommen zurück 👋', captureDay: 'Halte deinen Tag fest', recentMoments: 'Deine letzten Momente',
    captureTitle: 'Was möchtest du festhalten?', photo: 'Foto', speak: 'Erzähl mir',
    foodLabel: 'Essen', foodTitle: 'Was hast du gegessen?', mealPlaceholder: 'Tippe los… z. B. Hähnchenpasta',
    chooseByPicture: 'Nach Bild auswählen', pictureHelp: 'Oder tippe, um die Auswahl einzugrenzen', photoSection: 'Foto', addPhoto: 'Foto hinzufügen',
    addNote: 'Notiz hinzufügen', saveMeal: 'Mahlzeit speichern', footer: 'Ein paar Wörter genügen — wir helfen beim Rest.', close: 'Schließen',
  },
  {
    language: 'fr', dir: 'ltr', today: 'Aujourd’hui', discoveries: 'Découvertes', moments: 'Mes moments',
    chooseLanguage: 'Choisir la langue', homeHeading: 'Bon retour 👋', captureDay: 'Note ta journée', recentMoments: 'Tes moments récents',
    captureTitle: 'Que veux-tu enregistrer ?', photo: 'Photo', speak: 'Raconter',
    foodLabel: 'Repas', foodTitle: 'Qu’as-tu mangé ?', mealPlaceholder: 'Commence à écrire… ex. pâtes au poulet',
    chooseByPicture: 'Choisir par image', pictureHelp: 'Ou commence à écrire pour affiner les choix', photoSection: 'Photo', addPhoto: 'Ajouter une photo',
    addNote: 'Ajouter une note', saveMeal: 'Enregistrer le repas', footer: 'Quelques mots suffisent — nous t’aidons pour le reste.', close: 'Fermer',
  },
];

async function seedReturningGuest(page: any, language: AppLanguage) {
  await page.addInitScript(({ language }) => {
    if (!localStorage.getItem('rhythm_language_v1')) localStorage.setItem('rhythm_language_v1', language);
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
    localStorage.setItem('nimmapp_moments_v1', '[]');
    localStorage.setItem('nimmapp_checkins_v1', '[]');
    sessionStorage.setItem('nimmapp_checkin_auto_opened', 'true');
  }, { language });
}

for (const copy of cases) {
  test(`${copy.language} keeps the mobile shell and full food capture flow in the selected language`, async ({ page }) => {
    await seedReturningGuest(page, copy.language);
    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('lang', copy.language);
    await expect(page.locator('html')).toHaveAttribute('dir', copy.dir);
    await expect(page.getByRole('heading', { name: copy.homeHeading, exact: true })).toBeVisible();
    await expect(page.getByText(copy.captureDay, { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: copy.recentMoments, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: copy.discoveries, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: copy.moments, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: copy.chooseLanguage, exact: true })).toBeVisible();
    await expect(page.getByText(copy.today, { exact: true }).last()).toBeVisible();

    await page.getByTestId('primary-capture-button').click();
    await expect(page.getByRole('heading', { name: copy.captureTitle, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: copy.photo, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: copy.speak, exact: true })).toBeVisible();

    await page.getByRole('button', { name: copy.photo, exact: true }).click();
    await expect(page.getByText(copy.foodLabel, { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: copy.foodTitle, exact: true })).toBeVisible();
    await expect(page.getByPlaceholder(copy.mealPlaceholder)).toBeVisible();
    await expect(page.getByText(copy.chooseByPicture, { exact: true })).toBeVisible();
    await expect(page.getByText(copy.pictureHelp, { exact: true })).toBeVisible();
    await expect(page.getByText(copy.photoSection, { exact: true })).toBeVisible();
    await expect(page.getByText(copy.addPhoto, { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: copy.addNote, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: copy.saveMeal, exact: true })).toBeVisible();
    await expect(page.getByText(copy.footer, { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: copy.close, exact: true })).toBeVisible();
  });
}

test('language selection persists across reload for every supported language', async ({ page }) => {
  await seedReturningGuest(page, 'en');
  await page.goto('/');
  let current = cases[0];

  for (const copy of cases) {
    await page.getByRole('button', { name: current.chooseLanguage, exact: true }).click();
    await page.locator(`[data-language-option="${copy.language}"]`).click();
    await expect(page.locator('html')).toHaveAttribute('lang', copy.language);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', copy.language);
    await expect(page.locator('html')).toHaveAttribute('dir', copy.dir);
    await expect(page.getByRole('heading', { name: copy.homeHeading, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: copy.chooseLanguage, exact: true })).toBeVisible();
    current = copy;
  }
});