const express = require('express');
const router = express.Router();
const { requireAuth, requirePage } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

// Public: customers place orders from the storefront without logging in.
router.post('/', orderController.createOrder);

// Admin-only: viewing/managing all orders.
const requireOrdersPage = requirePage('orders');
router.get('/', requireAuth, requireOrdersPage, orderController.getOrders);
router.get('/:id', requireAuth, requireOrdersPage, orderController.getOrderById);
router.patch('/:id/status', requireAuth, requireOrdersPage, orderController.updateOrderStatus);
router.delete('/:id', requireAuth, requireOrdersPage, orderController.deleteOrder);

module.exports = router;
