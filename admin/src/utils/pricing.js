// Shared final-price calculation. A store-wide discount (Settings > Global Discount),
// when enabled, applies to every product and takes priority over any individual
// product offer (hasOffer/discountType/discountValue).
export function calcFinalPrice(product, settings) {
  const selling = Number(product?.sellingPrice) || 0;
  const gd = settings?.globalDiscount;

  if (gd?.enabled && gd.value > 0) {
    return gd.type === 'percentage'
      ? Math.max(0, selling - (selling * gd.value / 100))
      : Math.max(0, selling - gd.value);
  }

  if (product?.hasOffer && product.discountValue > 0) {
    return product.discountType === 'percentage'
      ? Math.max(0, selling - (selling * product.discountValue / 100))
      : Math.max(0, selling - product.discountValue);
  }

  return selling;
}
