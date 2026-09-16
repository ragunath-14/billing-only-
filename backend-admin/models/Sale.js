const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    buyingPrice: { type: Number, required: true, default: 0 },
    imeiOrSerial: { type: String }
  }],
  totalAmount: { type: Number, required: true },
  subt: { type: Number },
  discount: { type: Object },
  gst: { type: Number },
  taxRate: { type: Number, default: 18 },
  billType: { type: String, default: 'GST' },
  paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Card', 'Credit'], default: 'Cash' }
}, { timestamps: true });

// Optimized Performance Indexes
saleSchema.index({ createdAt: -1 });
saleSchema.index({ customerName: 1 });
saleSchema.index({ customerPhone: 1 });
saleSchema.index({ totalAmount: 1 });

module.exports = mongoose.model('Sale', saleSchema);
