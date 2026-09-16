import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/admin.json';

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('Enter username').fill('admin');
  await page.getByPlaceholder('••••••••').fill('admin123');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL('http://localhost:5174/');
  await expect(page.getByText('Sparkle Crackers Hub')).toBeVisible();

  await page.context().storageState({ path: authFile });
});
