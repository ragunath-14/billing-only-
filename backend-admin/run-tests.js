const API_BASE = 'http://localhost:5000/api';

async function req(path, method = 'GET', body = null) {
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP Error ${res.status}: ${text}`);
  }
  return res.json();
}

async function runTests() {
  console.log('🚀 Starting End-to-End Tests & Data Seeding...\n');
  
  try {
    // 1. TEST CATEGORY CREATION
    console.log('[1/5] Testing Category Module...');
    const catData = { name: `TestCategory-${Date.now()}`, icon: '🧪', description: 'Test' };
    const catRes = await req('/categories', 'POST', catData);
    console.log('✅ Category created:', catRes.name);

    // 2. TEST PRODUCT CREATION
    console.log('\n[2/5] Testing Product Module...');
    const prodData = {
      name: `Test Firework ${Math.floor(Math.random() * 1000)}`,
      brand: 'Standard', category: catData.name, buyingPrice: 100, sellingPrice: 150, stock: 50, lowStockThreshold: 10
    };
    const prodRes = await req('/products', 'POST', prodData);
    const productId = prodRes._id;
    console.log('✅ Product created:', prodRes.name, '(Stock: 50)');

    // 3. TEST ONLINE ORDER PLACEMENT
    console.log('\n[3/5] Testing Online Order Placement...');
    const orderData = {
      customer: { name: 'John Test', phone: '9876543210', address: '123 Test Street' },
      items: [{ productId, name: prodData.name, qty: 5, price: 150, total: 750 }],
      totalAmount: 750, source: 'Online Store'
    };
    const orderRes = await req('/orders', 'POST', orderData);
    const orderId = orderRes._id;
    console.log('✅ Online Order placed. ID:', orderRes.orderId);

    // 4. TEST ORDER FETCHING
    console.log('\n[4/5] Testing Admin Order Retrieval...');
    const getOrdersRes = await req('/orders');
    const foundOrder = getOrdersRes.find(o => o._id === orderId);
    if (!foundOrder) throw new Error('Order not found');
    console.log('✅ Admin successfully retrieved the order.');

    // 5. TEST BILLING
    console.log('\n[5/5] Testing Billing & Stock Deduction...');
    const saleData = {
      customerName: foundOrder.customer.name, customerPhone: foundOrder.customer.phone, paymentMethod: 'UPI',
      products: [{ productId: foundOrder.items[0].productId, name: foundOrder.items[0].name, sellingPrice: foundOrder.items[0].price, quantity: foundOrder.items[0].qty, buyingPrice: prodData.buyingPrice, originalPrice: prodData.sellingPrice }],
      totalAmount: 750, billType: 'Estimate', discount: { type: 'percentage', value: 0 }, gst: 0, subt: 750, taxRate: 0
    };
    const saleRes = await req('/sales', 'POST', saleData);
    console.log('✅ Bill generated. Invoice No:', saleRes.invoiceNumber);

    // Verify Stock
    const updatedProdRes = await req('/products');
    const updatedProd = updatedProdRes.products ? updatedProdRes.products.find(p => p._id === productId) : updatedProdRes.find(p => p._id === productId);
    if (updatedProd && updatedProd.stock === 45) {
      console.log('✅ Stock deducted correctly! (50 -> 45)');
    } else {
      throw new Error(`Stock deduction failed. Expected 45, got ${updatedProd?.stock}`);
    }

    // Update Status
    const updateRes = await req(`/orders/${orderId}/status`, 'PATCH', { status: 'Delivered' });
    console.log('✅ Order status updated to Delivered.');
    console.log('\n🎉 ALL TESTS PASSED! Data seeded successfully.');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
  }
}

runTests();
