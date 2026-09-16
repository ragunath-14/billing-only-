const mongoose = require('mongoose');
const { PAGE_KEYS } = require('../constants/pages');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  allowedPages: [{ type: String, enum: PAGE_KEYS }],
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
