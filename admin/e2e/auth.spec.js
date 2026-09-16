import { test, expect } from '@playwright/test';

test('rejects invalid credentials with an error message', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('Enter username').fill('admin');
  await page.getByPlaceholder('••••••••').fill('wrong-password');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test('unauthenticated visitor is redirected from a protected page to login', async ({ browser }) => {
  // Fresh context with no stored token, independent of the shared admin session.
  // storageState must be overridden explicitly — browser.newContext() otherwise
  // inherits the project's configured (authenticated) storageState.
  const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await context.newPage();
  await page.goto('/products');
  await expect(page).toHaveURL(/\/login$/);
  await context.close();
});
