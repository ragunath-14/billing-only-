import { test, expect } from '@playwright/test';

test('add, update, and delete a customer through the UI', async ({ page }) => {
  const name = `E2E Customer ${Date.now()}`;
  const mobile = String(Math.floor(6000000000 + Math.random() * 3999999999));

  await page.goto('/customers');
  await page.getByRole('button', { name: 'Add Customer' }).click();

  // Labels aren't wired to inputs via htmlFor/id: Name's input is a direct
  // sibling, Mobile's is nested in an input-group so use its placeholder instead.
  await page.locator('label:has-text("Name *") + input').fill(name);
  await page.getByPlaceholder('10-digit number').fill(mobile);
  await page.getByRole('button', { name: 'Save' }).click();

  const row = page.locator('tr', { hasText: name });
  await expect(row).toBeVisible();
  await expect(row).toContainText(mobile);

  // Edit
  await row.locator('button').nth(1).click(); // pencil/edit icon button
  await page.locator('label:has-text("Name *") + input').fill(name + ' Updated');
  await page.getByRole('button', { name: 'Save' }).click();

  const updatedRow = page.locator('tr', { hasText: name + ' Updated' });
  await expect(updatedRow).toBeVisible();

  // Delete — the app uses window.confirm(), which Playwright must explicitly accept.
  page.once('dialog', (dialog) => dialog.accept());
  await updatedRow.locator('button').nth(2).click(); // trash/delete icon button

  await expect(page.locator('tr', { hasText: name + ' Updated' })).toHaveCount(0);
});
