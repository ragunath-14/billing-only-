const express = require('express');
const router = express.Router();
const { login, loginRateLimit, logout } = require('../controllers/authController');

router.post('/login', loginRateLimit, login);
router.post('/logout', logout);

module.exports = router;
