const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protects admin-only routes. Accepts the token either as a same-site httpOnly
// cookie (the SPA's flow) or as "Authorization: Bearer <token>" (non-browser
// API clients, e.g. the integration test suite).
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const headerToken = header.startsWith('Bearer ') ? header.slice(7) : null;
  const token = headerToken || req.cookies?.admin_token || null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === 'staff') {
      // Re-check against the DB on every request instead of trusting the pages/active
      // state the token was minted with — otherwise deactivating a staff account or
      // changing their page access doesn't take effect until their token expires (12h).
      const user = await User.findById(decoded.uid).lean();
      if (!user || !user.active) return res.status(401).json({ error: 'Invalid or expired token' });
      decoded.pages = user.allowedPages;
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Restricts a route to the single env-based super-admin (e.g. staff management).
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
}

// Restricts a route to users whose token carries at least one of the given page keys.
// Admin always passes — the super-admin isn't scoped by page permissions.
function requirePage(...pages) {
  return (req, res, next) => {
    if (req.user?.role === 'admin') return next();
    const userPages = req.user?.pages || [];
    if (pages.some(p => userPages.includes(p))) return next();
    return res.status(403).json({ error: 'You do not have access to this page' });
  };
}

module.exports = { requireAuth, requireAdmin, requirePage };
