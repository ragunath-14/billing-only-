const express = require('express');
const router = express.Router();
const { requireAuth, requirePage } = require('../middleware/auth');
const { getSettings, updateSettings } = require('../controllers/settingController');

// GET is public: SettingsContext loads shop info app-wide, including on the public /shop page.
router.get('/', getSettings);
router.post('/', requireAuth, requirePage('settings'), updateSettings);

module.exports = router;
