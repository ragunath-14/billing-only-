const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  brand: { type: String, required: true, trim: true },
  sku: { type: String, trim: true },
  category: { type: String, default: 'Other' },
  buyingPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  unit: { type: String, default: 'Box' },
  imageUrl: { type: String },
  barcode: { type: String, unique: true },
  imeiList: [{ type: String }],
  // What's inside a gift box / combo product, e.g. ["10x Sparklers", "5x Flower Pots"]
  boxContents: [{ type: String, trim: true }],
  // Offer / Discount fields
  hasOffer: { type: Boolean, default: false },
  offerLabel: { type: String, default: '' },              // e.g. "Summer Sale"
  discountType: { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
  discountValue: { type: Number, default: 0 },            // e.g. 10 (for 10% or ₹10 off)
  offerExpiry: { type: Date, default: null },
}, { timestamps: true });

// Optimized Indexes for High Speed
productSchema.index({ name: 'text', brand: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ barcode: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for discounted price
productSchema.virtual('finalPrice').get(function () {
  if (!this.hasOffer || this.discountValue <= 0) return this.sellingPrice;
  if (this.discountType === 'percentage') {
    return Math.max(0, this.sellingPrice - (this.sellingPrice * this.discountValue / 100));
  }
  return Math.max(0, this.sellingPrice - this.discountValue);
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
