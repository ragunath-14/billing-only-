import { describe, it, expect } from 'vitest';
import { calcFinalPrice } from '../pricing';

describe('calcFinalPrice', () => {
  it('returns the plain selling price when there is no discount', () => {
    expect(calcFinalPrice({ sellingPrice: 200 }, {})).toBe(200);
  });

  it('applies a global percentage discount over the selling price', () => {
    const price = calcFinalPrice(
      { sellingPrice: 200 },
      { globalDiscount: { enabled: true, type: 'percentage', value: 10 } }
    );
    expect(price).toBe(180);
  });

  it('applies a global fixed discount over the selling price', () => {
    const price = calcFinalPrice(
      { sellingPrice: 200 },
      { globalDiscount: { enabled: true, type: 'fixed', value: 50 } }
    );
    expect(price).toBe(150);
  });

  it('never drops the price below zero', () => {
    const price = calcFinalPrice(
      { sellingPrice: 30 },
      { globalDiscount: { enabled: true, type: 'fixed', value: 100 } }
    );
    expect(price).toBe(0);
  });

  it('falls through to a per-product offer when the global discount is disabled', () => {
    const price = calcFinalPrice(
      { sellingPrice: 200, hasOffer: true, discountType: 'percentage', discountValue: 25 },
      { globalDiscount: { enabled: false, type: 'percentage', value: 10 } }
    );
    expect(price).toBe(150);
  });

  it('prioritizes the global discount over a per-product offer', () => {
    const price = calcFinalPrice(
      { sellingPrice: 200, hasOffer: true, discountType: 'percentage', discountValue: 50 },
      { globalDiscount: { enabled: true, type: 'fixed', value: 20 } }
    );
    expect(price).toBe(180);
  });

  it('treats a missing/non-numeric sellingPrice as zero', () => {
    expect(calcFinalPrice({}, {})).toBe(0);
    expect(calcFinalPrice({ sellingPrice: 'nope' }, {})).toBe(0);
  });

  it('handles a missing settings object gracefully', () => {
    expect(calcFinalPrice({ sellingPrice: 100 }, undefined)).toBe(100);
  });
});
