const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  shopName: { type: String, default: 'Sparkle Crackers Hub' },
  address: { type: String, default: '123 Firework Lane, Sivakasi' },
  phone: { type: String, default: '+91 98765 43210' },
  email: { type: String, default: 'contact@sparkle.com' },
  gstin: { type: String, default: '22AAAAA0000A1Z5' },
  currency: { type: String, default: 'INR' },
  taxRate: { type: Number, default: 18 },
  lowStockAlert: { type: Boolean, default: true },
  printHeader: { type: String, default: 'Thank You for Shopping!' },
  printPaperSize: { type: String, enum: ['thermal', 'a4'], default: 'thermal' },
  globalDiscount: {
    enabled: { type: Boolean, default: false },
    type: { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
    value: { type: Number, default: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
