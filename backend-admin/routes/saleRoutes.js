const express = require('express');
const router = express.Router();
const { requireAuth, requirePage } = require('../middleware/auth');
const { getSales, createSale, getDashboardStats, deleteSale } = require('../controllers/saleController');

router.use(requireAuth, requirePage('dashboard', 'billing', 'pending', 'reports'));

router.get('/stats', getDashboardStats);
router.get('/', getSales);
router.post('/', createSale);
router.delete('/:id', deleteSale);

module.exports = router;
