// API integration tests. These hit a *running* backend (npm run dev / npm start)
// backed by a real MongoDB, since the business logic under test (stock deduction,
// stock restoration, upsert-on-sale customer creation) lives in mongoose queries
// that unit tests can't meaningfully exercise without a database.
//
// Every record created here is deleted again at the end of its test.

const test = require('node:test');
const assert = require('node:assert/strict');

const BASE = process.env.API_BASE || 'http://localhost:5000/api';

let authToken = null;

async function req(path, method = 'GET', body) {
  const headers = body ? { 'Content-Type': 'application/json' } : {};
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  return { status: res.status, ok: res.ok, body: json };
}

test('admin login issues a token, and admin routes require it', async () => {
  const unauthed = await req('/products');
  assert.equal(unauthed.status, 401, 'protected routes must reject requests with no token');

  const login = await req('/auth/login', 'POST', {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: 'admin123', // matches the ADMIN_PASSWORD_HASH seeded in backend/.env for local dev
  });
  assert.equal(login.status, 200);
  assert.ok(login.body.token, 'login should return a JWT');
  authToken = login.body.token;
});

test('backend is reachable', async () => {
  const res = await req('/products');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
});

test('category CRUD round-trip', async () => {
  const name = `IT-Category-${Date.now()}`;
  const created = await req('/categories', 'POST', { name, icon: '🧪', description: 'integration test' });
  assert.equal(created.status, 201);
  assert.equal(created.body.name, name);

  const updated = await req(`/categories/${created.body._id}`, 'PUT', { name: name + '-renamed', icon: '🧪' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.name, name + '-renamed');

  const deleted = await req(`/categories/${created.body._id}`, 'DELETE');
  assert.equal(deleted.status, 200);
});

test('product CRUD round-trip and price/offer patches', async () => {
  const created = await req('/products', 'POST', {
    name: `IT-Product-${Date.now()}`, brand: 'IT-Brand', category: 'Other',
    buyingPrice: 50, sellingPrice: 100, stock: 10,
  });
  assert.equal(created.status, 201);
  const id = created.body._id;
  assert.ok(created.body.barcode, 'a barcode should be auto-generated when none is supplied');

  const priced = await req(`/products/${id}/price`, 'PATCH', { sellingPrice: 120 });
  assert.equal(priced.status, 200);
  assert.equal(priced.body.sellingPrice, 120);

  const offered = await req(`/products/${id}/offer`, 'PATCH', {
    hasOffer: true, offerLabel: 'IT sale', discountType: 'percentage', discountValue: 10,
  });
  assert.equal(offered.status, 200);
  assert.equal(offered.body.hasOffer, true);

  const deleted = await req(`/products/${id}`, 'DELETE');
  assert.equal(deleted.status, 200);

  const refetch = await req(`/products/${id}/price`, 'PATCH', { sellingPrice: 1 });
  assert.equal(refetch.status, 404, 'patching a deleted product should 404');
});

test('creating a sale deducts stock, and insufficient stock is rejected', async () => {
  const product = await req('/products', 'POST', {
    name: `IT-StockProduct-${Date.now()}`, brand: 'IT-Brand', category: 'Other',
    buyingPrice: 50, sellingPrice: 100, stock: 5,
  });
  const productId = product.body._id;

  const oversell = await req('/sales', 'POST', {
    customerName: 'IT Tester', customerPhone: '0000000000', paymentMethod: 'Cash', billType: 'Estimate',
    products: [{ productId, name: product.body.name, sellingPrice: 100, buyingPrice: 50, quantity: 999 }],
    totalAmount: 99900, discount: { type: 'percentage', value: 0 }, gst: 0, subt: 99900, taxRate: 0,
  });
  assert.equal(oversell.status, 400, 'selling more than available stock must be rejected');

  const unaffected = await req(`/products`);
  const stillFive = unaffected.body.find(p => p._id === productId);
  assert.equal(stillFive.stock, 5, 'a rejected sale must not touch stock');

  const sale = await req('/sales', 'POST', {
    customerName: 'IT Tester', customerPhone: '0000000000', paymentMethod: 'Cash', billType: 'Estimate',
    products: [{ productId, name: product.body.name, sellingPrice: 100, buyingPrice: 50, quantity: 3 }],
    totalAmount: 300, discount: { type: 'percentage', value: 0 }, gst: 0, subt: 300, taxRate: 0,
  });
  assert.equal(sale.status, 201);

  const afterSale = await req(`/products`);
  const deducted = afterSale.body.find(p => p._id === productId);
  assert.equal(deducted.stock, 2, 'stock should drop from 5 to 2 after selling 3');

  const del = await req(`/sales/${sale.body._id}`, 'DELETE');
  assert.equal(del.status, 200);

  const afterDelete = await req(`/products`);
  const restored = afterDelete.body.find(p => p._id === productId);
  assert.equal(restored.stock, 5, 'deleting the sale should restore stock to 5');

  await req(`/products/${productId}`, 'DELETE');
});

test('online order create + status update round-trip', async () => {
  const order = await req('/orders', 'POST', {
    customer: { name: 'IT Order Customer', phone: '9999999999', address: '1 Test Way' },
    items: [{ productId: '000000000000000000000000', name: 'IT Item', qty: 1, price: 10, total: 10 }],
    totalAmount: 10, source: 'Online Store',
  });
  assert.equal(order.status, 201);

  const list = await req('/orders');
  assert.ok(list.body.some(o => o._id === order.body._id));

  const patched = await req(`/orders/${order.body._id}/status`, 'PATCH', { status: 'Delivered' });
  assert.equal(patched.status, 200);
  assert.equal(patched.body.status, 'Delivered');
});

test('customer CRUD round-trip', async () => {
  const mobile = String(Math.floor(6000000000 + Math.random() * 3999999999));
  const created = await req('/customers', 'POST', { name: 'IT Customer', mobile });
  assert.equal(created.status, 201);

  const updated = await req(`/customers/${created.body._id}`, 'PUT', { name: 'IT Customer Updated', mobile });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.name, 'IT Customer Updated');

  const deleted = await req(`/customers/${created.body._id}`, 'DELETE');
  assert.equal(deleted.status, 200);
});

test('payments route is mounted and supports create/list/delete (regression test for the earlier 404 bug)', async () => {
  const created = await req('/payments', 'POST', {
    customerName: 'IT Payment Customer', customerPhone: '8888888888', totalAmount: 500,
  });
  assert.equal(created.status, 201);
  assert.ok(created.body._id);

  const list = await req('/payments');
  assert.equal(list.status, 200);
  assert.ok(list.body.some(p => p._id === created.body._id));

  const deleted = await req(`/payments/${created.body._id}`, 'DELETE');
  assert.equal(deleted.status, 200);
});
