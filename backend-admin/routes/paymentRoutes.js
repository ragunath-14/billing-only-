const express = require('express');
const router = express.Router();
const { requireAuth, requirePage } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

router.use(requireAuth, requirePage('pending', 'customers'));

router.get('/', paymentController.getPayments);
router.post('/', paymentController.createPayment);
router.post('/:id/partial', paymentController.addPartialPayment);
router.delete('/:id', paymentController.deletePayment);

module.exports = router;
