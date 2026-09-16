const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');

const DUMMY_HASH = '$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva';

// 60 attempts per 15 minutes per IP — generous enough for a real admin (and this
// app's own e2e suite, which logs in before nearly every test) across repeated runs,
// while still cutting off naive password-guessing scripts long before meaningful coverage.
// bcrypt's own per-attempt cost is the primary brute-force defense; this is defense-in-depth.
exports.loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
});

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (username === process.env.ADMIN_USERNAME) {
      // Always run bcrypt.compare (even on a bad username) so response timing doesn't leak which part was wrong.
      const validPassword = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
      if (!validPassword) return res.status(401).json({ error: 'Invalid username or password' });

      const token = jwt.sign({ sub: username, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '12h' });
      return res.json({ token, username });
    }

    // Not the super-admin — check DB-backed staff accounts created via Staff Management.
    const user = await User.findOne({ username: username.toLowerCase().trim(), active: true });
    const validPassword = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
    if (!user || !validPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { sub: user.username, role: 'staff', uid: user._id.toString(), pages: user.allowedPages },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};
