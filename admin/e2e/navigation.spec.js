import { test, expect } from '@playwright/test';

// Runs as the authenticated 'chromium' project (storageState from auth.setup.js).
const pages = [
  { path: '/',              label: 'Dashboard' },
  { path: '/billing',       label: 'Billing' },
  { path: '/products',      label: 'Inventory' },
  { path: '/categories',    label: 'Categories' },
  { path: '/pending',       label: 'Pending Payments' },
  { path: '/orders',        label: 'Online Orders' },
  { path: '/online-billing', label: 'Online Billing' },
  { path: '/customers',     label: 'Customers' },
  { path: '/users',         label: 'Staff Management' },
  { path: '/settings',      label: 'System Settings' },
];

for (const { path, label } of pages) {
  test(`sidebar link "${label}" loads ${path} without console errors`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(`${path.replace('/', '\\/')}$`));
    // Sidebar itself renders the label as a nav link, confirming the layout mounted.
    // exact:true avoids "Billing" matching "Online Billing" (and "Inventory" matching
    // the "Sales & Inventory" section header).
    await expect(page.locator('.sidebar').getByRole('link', { name: label, exact: true })).toBeVisible();

    expect(errors, `console/page errors on ${path}:\n${errors.join('\n')}`).toEqual([]);
  });
}
