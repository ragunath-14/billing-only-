const express = require('express');
const router = express.Router();
const { requireAuth, requirePage } = require('../middleware/auth');
const { getSettings, updateSettings } = require('../controllers/settingController');

// Any authenticated user needs shop info (tax rate, currency, GSTIN for receipts) regardless
// of which specific pages they're granted — only the update below is settings-page-gated.
router.get('/', requireAuth, getSettings);
router.post('/', requireAuth, requirePage('settings'), updateSettings);

module.exports = router;
