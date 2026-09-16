// Mirrors backend/constants/pages.js. Drives the Sidebar's visible links,
// route guarding, and the checkbox list on the Staff Management page.
export const PAGE_DEFS = [
  { key: 'dashboard',      label: 'Dashboard',        path: '/' },
  { key: 'billing',        label: 'Billing',          path: '/billing' },
  { key: 'products',       label: 'Inventory',        path: '/products' },
  { key: 'categories',     label: 'Categories',       path: '/categories' },
  { key: 'orders',         label: 'Online Orders',    path: '/orders' },
  { key: 'online-billing', label: 'Online Billing',   path: '/online-billing' },
  { key: 'pending',        label: 'Pending Payments', path: '/pending' },
  { key: 'customers',      label: 'Customers',        path: '/customers' },
  { key: 'settings',       label: 'System Settings',  path: '/settings' },
];
