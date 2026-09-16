const mongoose = require('mongoose');

// Audit trail for staff-account changes (Staff Management), so the admin can
// see who created/edited/removed a login and what access changed.
const userLogSchema = new mongoose.Schema({
  action: { type: String, enum: ['created', 'updated', 'deleted'], required: true },
  targetUsername: { type: String, required: true },
  performedBy: { type: String, required: true },
  details: { type: String, default: '' },
}, { timestamps: true });

userLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('UserLog', userLogSchema);
