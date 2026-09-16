const jwt = require('jsonwebtoken');

// Protects admin-only routes. Expects "Authorization: Bearer <token>".
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
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
