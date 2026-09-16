function calcFinalPrice(product, settings) {
  const selling = Number(product.sellingPrice) || 0;
  const gd = settings && settings.globalDiscount;

  if (gd && gd.enabled && gd.value > 0) {
    return gd.type === 'percentage'
      ? Math.max(0, selling - (selling * gd.value / 100))
      : Math.max(0, selling - gd.value);
  }

  if (product.hasOffer && product.discountValue > 0) {
    return product.discountType === 'percentage'
      ? Math.max(0, selling - (selling * product.discountValue / 100))
      : Math.max(0, selling - product.discountValue);
  }

  return selling;
}

module.exports = { calcFinalPrice };
