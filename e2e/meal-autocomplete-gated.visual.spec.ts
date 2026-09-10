import { test, expect } from '@playwright/test';

async function openAvailableMealCheckin(page: any) {
  await page.goto('/');
  const checkin = page.getByRole('button', { name: /تسجيل|مساء|منتصف|يومك/ }).first();
  await expect(checkin).toBeVisible();
  await checkin.click();
  const input = page.getByPlaceholder('ماذا أكلت؟ ابحث أو اكتب…');
  if (!await input.isVisible().catch(() => false)) {
    const lastStep = page.getByRole('button', { name: /خطوة أخيرة/ });
    if (await lastStep.isVisible().catch(() => false)) await lastStep.click();
  }
  await expect(input).toBeVisible();
  return input;
}

async function setArabicGuest(page: any) {
  await page.route('**/api/locale', async (route: any) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ country: 'MA' }),
  }));
  await page.addInitScript(() => {
    localStorage.setItem('rhythm_language_v1', 'ar');
    localStorage.setItem('cary_access_mode_v1', 'guest');
    localStorage.setItem('cary_onboarding_v2_complete', 'true');
  });
}

test('gated daily check-in AI autocomplete understands composed Arabic dishes', async ({ page }) => {
  await setArabicGuest(page);
  await page.route('**/api/food-autocomplete', async (route: any) => {
    const body = JSON.parse(route.request().postData() || '{}');
    const map: Record<string, string[]> = {
      'بيض مسلوق': ['بيض مسلوق'],
      'بيض مقلي': ['بيض مقلي'],
      'طاجين دجاج بالزيتون': ['طاجين دجاج بالزيتون'],
      'كسكس بالخضر': ['كسكس بالخضر'],
    };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ suggestions: map[body.query] || [] }) });
  });
  const input = await openAvailableMealCheckin(page);
  for (const term of ['بيض مسلوق', 'بيض مقلي', 'طاجين دجاج بالزيتون', 'كسكس بالخضر']) {
    await input.fill(term);
    await expect(page.getByRole('button', { name: term, exact: true })).toBeVisible();
  }
});

test('gated AI meal autocomplete handles Darija typos preparation and mixed language input', async ({ page }) => {
  await setArabicGuest(page);
  const cases: Record<string, string[]> = {
    'بيض مسلوق': ['بيض مسلوق'],
    'بيض مسلوق مع زيت الزيتون': ['بيض مسلوق مع زيت الزيتون'],
    'بيض مقلي': ['بيض مقلي'],
    'بيض بالطماطم': ['بيض بالطماطم'],
    'بيض و مطيشة': ['بيض ومطيشة'],
    'بيض مطيشة': ['بيض ومطيشة'],
    'طاجين دجاج': ['طاجين دجاج'],
    'طاجين دجاج بالزيتون': ['طاجين دجاج بالزيتون'],
    'طاجين اللحم بالبرقوق': ['طاجين اللحم بالبرقوق'],
    'كسكس بالخضر': ['كسكس بالخضر'],
    'كسكس باللحم': ['كسكس باللحم'],
    'حريرة مغربية': ['حريرة مغربية'],
    'مسمن بالعسل': ['مسمن بالعسل'],
    'مسمن بالجبن': ['مسمن بالجبن'],
    'خبز وزيت الزيتون': ['خبز وزيت الزيتون'],
    'اتاي بالنعناع': ['أتاي بالنعناع'],
    'قهوة بالحليب': ['قهوة بالحليب'],
    'omelette بالجبن': ['أومليت بالجبن'],
    'egg مسلوق': ['بيض مسلوق'],
    'tajine دجاج': ['طاجين دجاج'],
  };
  await page.route('**/api/food-autocomplete', async (route: any) => {
    const body = JSON.parse(route.request().postData() || '{}');
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ suggestions: cases[body.query] || [] }) });
  });
  const input = await openAvailableMealCheckin(page);
  for (const [typed, suggestions] of Object.entries(cases)) {
    await input.fill(typed);
    await expect(page.getByRole('button', { name: suggestions[0], exact: true }), typed + ' should get an AI suggestion').toBeVisible();
  }
});

test('gated AI meal autocomplete degrades gracefully when API fails', async ({ page }) => {
  await setArabicGuest(page);
  await page.route('**/api/food-autocomplete', async (route: any) => route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }));
  const input = await openAvailableMealCheckin(page);
  await input.fill('بيض');
  await expect(page.getByTestId('meal-recognized-food')).toBeVisible();
  await input.fill('طبق غير معروف');
  await expect(page.getByRole('button', { name: 'إضافة هذا الطبق' })).toBeVisible();
});
