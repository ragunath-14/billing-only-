const bcrypt = require('bcryptjs');
const User = require('../models/User');
const UserLog = require('../models/UserLog');
const { PAGE_KEYS } = require('../constants/pages');

function sanitizePages(allowedPages) {
  if (!Array.isArray(allowedPages)) return [];
  return [...new Set(allowedPages)].filter(p => PAGE_KEYS.includes(p));
}

function logUserChange(action, targetUsername, performedBy, details) {
  // Fire-and-forget — a logging failure should never block the actual staff-account change.
  UserLog.create({ action, targetUsername, performedBy, details }).catch(err => console.error('UserLog write failed:', err));
}

// Builds a human-readable summary of what changed between the pre-update user
// document and the fields the admin submitted, for the activity log.
function diffUserUpdate(before, update) {
  const parts = [];
  if (update.username !== undefined && update.username !== before.username) {
    parts.push(`username: "${before.username}" → "${update.username}"`);
  }
  if (update.allowedPages !== undefined) {
    const from = [...before.allowedPages].sort().join(', ') || '(none)';
    const to = [...update.allowedPages].sort().join(', ') || '(none)';
    if (from !== to) parts.push(`pages: [${from}] → [${to}]`);
  }
  if (update.active !== undefined && update.active !== before.active) {
    parts.push(`status: ${before.active ? 'active' : 'disabled'} → ${update.active ? 'active' : 'disabled'}`);
  }
  if (update.passwordHash !== undefined) {
    parts.push('password changed');
  }
  return parts.join('; ') || 'no fields changed';
}

// List all staff accounts (never returns passwordHash).
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a staff account: an ID/password plus the pages the admin wants that user to see.
exports.createUser = async (req, res) => {
  try {
    const { username, password, allowedPages } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const normalizedUsername = username.toLowerCase().trim();
    const existing = await User.findOne({ username: normalizedUsername });
    if (existing) return res.status(400).json({ error: 'Username already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: normalizedUsername,
      passwordHash,
      allowedPages: sanitizePages(allowedPages),
    });

    const { passwordHash: _omit, ...safeUser } = user.toObject();
    logUserChange('created', user.username, req.user.sub, `pages: [${user.allowedPages.join(', ') || '(none)'}]`);
    res.status(201).json(safeUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Edit a staff account: username, page access, active flag, and optionally a new password.
exports.updateUser = async (req, res) => {
  try {
    const before = await User.findById(req.params.id);
    if (!before) return res.status(404).json({ error: 'User not found' });

    const { username, password, allowedPages, active } = req.body;
    const update = {};

    if (username !== undefined) update.username = username.toLowerCase().trim();
    if (allowedPages !== undefined) update.allowedPages = sanitizePages(allowedPages);
    if (active !== undefined) update.active = !!active;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      update.passwordHash = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-passwordHash');
    logUserChange('updated', before.username, req.user.sub, diffUserUpdate(before, update));
    res.json(user);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Username already exists' });
    res.status(400).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    logUserChange('deleted', user.username, req.user.sub, `pages were: [${user.allowedPages.join(', ') || '(none)'}]`);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// List staff-account activity for the admin's audit view.
exports.listLogs = async (req, res) => {
  try {
    const logs = await UserLog.find().sort({ createdAt: -1 }).limit(200).lean();
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
