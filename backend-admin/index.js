require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');

// ── Route imports ──────────────────────────────────────────────────────────────
// No shopRoutes here — this service is admin-only; the public storefront is
// served by the separate backend/ + frontend/billing app.
const productRoutes  = require('./routes/productRoutes');
const saleRoutes     = require('./routes/saleRoutes');
const customerRoutes = require('./routes/customerRoutes');
const settingRoutes  = require('./routes/settingRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const paymentRoutes  = require('./routes/paymentRoutes');
const authRoutes     = require('./routes/authRoutes');
const userRoutes     = require('./routes/userRoutes');

// ── Auth config guard ──────────────────────────────────────────────────────────
if (!process.env.JWT_SECRET || !process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD_HASH) {
  console.error('❌  Missing JWT_SECRET / ADMIN_USERNAME / ADMIN_PASSWORD_HASH in .env — see backend-admin/.env.example');
  process.exit(1);
}

const app = express();

// Render (and most PaaS hosts) sit in front of the app behind a single reverse
// proxy — trust exactly one hop so req.ip / X-Forwarded-For reflect the real
// client instead of the proxy, which the login rate limiter keys on.
app.set('trust proxy', 1);

const compression = require('compression');
app.use(compression());

// Several pages render inline <style> blocks and the app pulls Google Fonts,
// so those are explicitly allow-listed; everything else defaults to 'self'.
// This blocks injected <script>/remote content from exfiltrating data even if
// an XSS bug slips through React's default escaping.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginResourcePolicy: { policy: 'same-site' },
  // Explicit (rather than relying on helmet's default) so browsers cache the
  // HTTPS-only instruction for a full year and apply it to subdomains too.
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

// CORS: same-origin requests (the SPA served by this same app) always pass.
// Cross-origin browser requests are only allowed from origins explicitly
// listed in CORS_ORIGIN (comma-separated) or this service's own Render URL —
// everything else is rejected so a page on another site can't call the API
// on a logged-in admin's behalf. In development, any localhost/127.0.0.1 port
// is allowed too (e.g. the Vite dev server) — but never an arbitrary origin,
// since that's now paired with `credentials: true` below: reflecting *any*
// origin while allowing credentials would let any website read authenticated
// responses via a credentialed fetch against a locally-running dev backend.
const isProd = process.env.NODE_ENV === 'production';
const allowedOrigins = [process.env.RENDER_EXTERNAL_URL, ...(process.env.CORS_ORIGIN || '').split(',')]
  .map(s => s && s.trim())
  .filter(Boolean);
const isLocalDevOrigin = (origin) => !isProd && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || isLocalDevOrigin(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  // Required so the browser will actually send/accept the httpOnly auth cookie
  // on cross-origin requests (e.g. the Vite dev server talking to this API).
  credentials: true,
}));

app.use(cookieParser());

// 4mb headroom for product photos, which arrive as base64 data URIs
// (client-side compressed to ~900px/JPEG q0.8, but base64 adds ~33% overhead).
app.use(express.json({ limit: '4mb' }));

// Strips any request key starting with "$" or containing "." from body/params/query,
// so a crafted payload like { "username": { "$ne": null } } can't be used to bypass
// a Mongo query's intended match.
app.use(mongoSanitize());

// General abuse/scraping brake across the whole API — generous enough for normal
// UI usage (dashboard pages fire several requests at once) while capping how much
// data an automated client can pull per IP. Login has its own, stricter limiter.
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
}));

// ── Database (optimized connection) ────────────────────────────────────────────
// Same MongoDB cluster as the public backend/ service — admin and shop read
// and write the same underlying data, just through two separate API services.
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/crackers-shop', {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}).then(() => console.log('✅  MongoDB connected (pooled)'))
  .catch(err => console.error('❌  MongoDB error:', err));

const path = require('path');
app.use('/api/auth',      authRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/products',  productRoutes);
app.use('/api/sales',     saleRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/settings',  settingRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payments',   paymentRoutes);

// ── Static Frontend Serving (PROD) ───────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../admin/dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
} else {
  app.get('/', (req, res) => res.send('Admin backend is running... Use admin/ dev server for UI.'));
}

// ── Start ──────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀  Admin backend on http://localhost:${PORT}`));
