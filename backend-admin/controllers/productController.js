const Product = require('../models/Product');

// GET all products (optimized with lean)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST create product
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    if (!product.barcode) product.barcode = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Bulk create (HIGH PERFORMANCE)
exports.createProductsBulk = async (req, res) => {
  try {
    if (!Array.isArray(req.body)) return res.status(400).json({ error: 'Body must be an array' });
    const list = req.body.map(p => {
      if (!p.barcode) p.barcode = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      return p;
    });
    const result = await Product.insertMany(list, { ordered: false });
    res.status(201).json({ count: result.length });
  } catch (err) {
    res.status(400).json({ error: 'Bulk upload failed partially', details: err.message });
  }
};

// PUT full update
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, { $set: req.body }, { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PATCH price only
exports.updatePrice = async (req, res) => {
  try {
    const { buyingPrice, sellingPrice } = req.body;
    const update = {};
    if (buyingPrice !== undefined) update.buyingPrice = buyingPrice;
    if (sellingPrice !== undefined) update.sellingPrice = sellingPrice;
    const product = await Product.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PATCH offer
exports.updateOffer = async (req, res) => {
  try {
    const { hasOffer, offerLabel, discountType, discountValue, offerExpiry } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: { hasOffer, offerLabel, discountType, discountValue, offerExpiry } },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
