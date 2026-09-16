import { test, expect } from '@playwright/test';

test('add, view, and delete a product through the UI', async ({ page }) => {
  const productName = `E2E Test Product ${Date.now()}`;

  await page.goto('/products');
  await page.getByRole('button', { name: 'New Stock' }).click();

  // Form labels aren't wired to inputs via htmlFor/id, so getByLabel can't find
  // them — select via the adjacent-sibling relationship in ProductFormModal instead.
  await page.getByPlaceholder('e.g. 10cm Sparklers').fill(productName);
  await page.getByPlaceholder('e.g. Standard').fill('E2E Brand');
  await page.locator('label:has-text("Cost Price (₹) *") + input').fill('50');
  await page.locator('label:has-text("Selling Price (₹) *") + input').fill('100');
  await page.locator('label:has-text("Stock Quantity *") + input').fill('25');

  await page.getByRole('button', { name: 'Save Product' }).click();

  const row = page.locator('tr', { hasText: productName });
  await expect(row).toBeVisible();
  await expect(row).toContainText('₹100');
  await expect(row).toContainText('25');

  await row.getByTitle('Delete Product').click();
  await page.getByRole('button', { name: 'Yes, Delete' }).click();

  await expect(page.locator('tr', { hasText: productName })).toHaveCount(0);
});

test('rejects a product with no name (required field validation)', async ({ page }) => {
  await page.goto('/products');
  await page.getByRole('button', { name: 'New Stock' }).click();

  await page.getByPlaceholder('e.g. Standard').fill('No Name Brand');
  await page.locator('label:has-text("Cost Price (₹) *") + input').fill('10');
  await page.locator('label:has-text("Selling Price (₹) *") + input').fill('20');
  await page.locator('label:has-text("Stock Quantity *") + input').fill('1');

  const nameInput = page.getByPlaceholder('e.g. 10cm Sparklers');
  await page.getByRole('button', { name: 'Save Product' }).click();

  // Native HTML5 required-field validation should block submission — the modal stays open.
  await expect(page.getByRole('heading', { name: 'Add New Product' })).toBeVisible();
  await expect(nameInput).toHaveJSProperty('validity.valid', false);

  await page.getByRole('button', { name: 'Cancel' }).click();
});
