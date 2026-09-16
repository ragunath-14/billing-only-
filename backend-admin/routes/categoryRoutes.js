const express = require('express');
const router = express.Router();
const { requireAuth, requirePage } = require('../middleware/auth');
const categoryController = require('../controllers/categoryController');

router.use(requireAuth, requirePage('categories', 'products', 'billing'));

router.get('/', categoryController.getCategories);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
