import { expect, test } from '@playwright/test';

test('intake explains the strict factory contract', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Eine Idee rein/i })).toBeVisible();
  await expect(page.getByText('Tests vor Deploy')).toBeVisible();
  await expect(page.getByText('Secrets nie im Repo')).toBeVisible();
  await expect(page.getByRole('button', { name: 'App erstellen' })).toBeVisible();
});

test('short ideas are rejected before an API call', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Geschäftsidee').fill('Todo App');
  await page.getByRole('button', { name: 'App erstellen' }).click();
  await expect(page.getByRole('alert')).toContainText('mindestens 20 Zeichen');
});
