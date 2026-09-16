const express = require('express');
const router = express.Router();
const { login, loginRateLimit } = require('../controllers/authController');

router.post('/login', loginRateLimit, login);

module.exports = router;
