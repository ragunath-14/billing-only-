const test = require('node:test');
const assert = require('node:assert/strict');
const { calcFinalPrice } = require('../utils/pricing');

test('returns the plain selling price when there is no discount', () => {
  const price = calcFinalPrice({ sellingPrice: 200 }, {});
  assert.equal(price, 200);
});

test('applies a global percentage discount over the selling price', () => {
  const price = calcFinalPrice(
    { sellingPrice: 200 },
    { globalDiscount: { enabled: true, type: 'percentage', value: 10 } }
  );
  assert.equal(price, 180);
});

test('applies a global fixed discount over the selling price', () => {
  const price = calcFinalPrice(
    { sellingPrice: 200 },
    { globalDiscount: { enabled: true, type: 'fixed', value: 50 } }
  );
  assert.equal(price, 150);
});

test('global discount never drops the price below zero', () => {
  const price = calcFinalPrice(
    { sellingPrice: 30 },
    { globalDiscount: { enabled: true, type: 'fixed', value: 100 } }
  );
  assert.equal(price, 0);
});

test('a disabled global discount falls through to a per-product offer', () => {
  const price = calcFinalPrice(
    { sellingPrice: 200, hasOffer: true, discountType: 'percentage', discountValue: 25 },
    { globalDiscount: { enabled: false, type: 'percentage', value: 10 } }
  );
  assert.equal(price, 150);
});

test('global discount takes priority over a per-product offer', () => {
  const price = calcFinalPrice(
    { sellingPrice: 200, hasOffer: true, discountType: 'percentage', discountValue: 50 },
    { globalDiscount: { enabled: true, type: 'fixed', value: 20 } }
  );
  assert.equal(price, 180);
});

test('applies a per-product fixed discount when no global discount is set', () => {
  const price = calcFinalPrice(
    { sellingPrice: 200, hasOffer: true, discountType: 'fixed', discountValue: 40 },
    {}
  );
  assert.equal(price, 160);
});

test('a per-product offer with zero/negative discountValue is ignored', () => {
  const price = calcFinalPrice(
    { sellingPrice: 200, hasOffer: true, discountType: 'percentage', discountValue: 0 },
    {}
  );
  assert.equal(price, 200);
});

test('missing/non-numeric sellingPrice is treated as zero', () => {
  assert.equal(calcFinalPrice({}, {}), 0);
  assert.equal(calcFinalPrice({ sellingPrice: 'not-a-number' }, {}), 0);
});
