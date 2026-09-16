const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'Partial', 'Completed'], default: 'Pending' },
  history: [{
    amount: Number,
    date: { type: Date, default: Date.now },
    method: { type: String, default: 'Cash' },
    note: String
  }]
}, { timestamps: true });

paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
