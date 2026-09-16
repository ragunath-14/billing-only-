const express = require('express');
const router = express.Router();
const { requireAuth, requirePage } = require('../middleware/auth');
const {
  getProducts, createProduct, createProductsBulk, updateProduct,
  updatePrice, updateOffer, deleteProduct
} = require('../controllers/productController');

router.use(requireAuth, requirePage('products', 'billing'));

router.get('/', getProducts);
router.post('/', createProduct);
router.post('/bulk', createProductsBulk);
router.put('/:id', updateProduct);
router.patch('/:id/price', updatePrice);
router.patch('/:id/offer', updateOffer);
router.delete('/:id', deleteProduct);

module.exports = router;
