const express = require('express');
const router = express.Router();
const { requireAuth, requirePage } = require('../middleware/auth');
const controller = require('../controllers/customerController');

router.use(requireAuth, requirePage('customers', 'billing'));

router.get('/', controller.getCustomers);
router.post('/', controller.createCustomer);
router.put('/:id', controller.updateCustomer);
router.delete('/:id', controller.deleteCustomer);

module.exports = router;
