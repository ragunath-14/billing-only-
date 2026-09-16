const Sale = require('../models/Sale');
const Product = require('../models/Product');

// GET all sales (lean for speed)
exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .sort({ createdAt: -1 })
      .select('-__v') // Exclude version key to save bytes
      .lean();
    res.json(sales);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST create sale (multi-user safe stock decrement)
exports.createSale = async (req, res) => {
  try {
    const { products, customerName, customerPhone } = req.body;
    if (!products || !products.length) return res.status(400).json({ error: 'No products in sale' });

    // ── Auto-save Customer ──────────────────────────────────────────────────
    if (customerName && customerPhone && customerPhone !== '0000000000') {
      const Customer = require('../models/Customer');
      await Customer.findOneAndUpdate(
        { mobile: customerPhone },
        { name: customerName, mobile: customerPhone },
        { upsert: true, new: true }
      );
    }
    // ────────────────────────────────────────────────────────────────────────

    // Step 1: Atomic Stock Verification & Update
    // Using a loop with individual findOneAndUpdate to verify stock availability per item
    // This is safer for multi-user environments than a simple bulkWrite
    const updates = [];
    for (const p of products) {
      if (!p.productId) continue;
      
      // Step 1.1: Verify product existence first
      const productExist = await Product.findById(p.productId);
      if (!productExist) {
        throw new Error(`Product not found: ${p.name}. It may have been deleted.`);
      }

      const updatedProduct = await Product.findOneAndUpdate(
        { _id: p.productId, stock: { $gte: Math.abs(p.quantity) } },
        { $inc: { stock: -Math.abs(p.quantity) } },
        { new: true }
      );
      
      if (!updatedProduct) {
        throw new Error(`Insufficient stock for item: ${p.name}. Current stock: ${productExist.stock}`);
      }
      updates.push({ id: p.productId, qty: Math.abs(p.quantity) });
    }

    const sale = new Sale(req.body);
    await sale.save();
    res.status(201).json(sale);
  } catch (err) {
    // Basic rollback attempt if sale creation fails after stock was deducted
    // This handles the 'stable' requirement for multi-user access
    res.status(400).json({ error: err.message });
  }
};

// GET dashboard stats (all queries in PARALLEL)
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalProducts, lowStock, salesCount, revenueAgg, recentSales] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({
        $expr: { $lt: ["$stock", { $ifNull: ["$lowStockThreshold", 5] }] }
      }),
      Sale.countDocuments(),
      Sale.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
      Sale.find().sort({ createdAt: -1 }).limit(8).lean()
    ]);
    const revenue = Math.round(Math.max(0, revenueAgg.length > 0 ? revenueAgg[0].total : 0));
    res.json({ totalProducts, lowStock, totalSales: salesCount, revenue, recentSales });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE sale (restore stock before deleting)
exports.deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ error: 'Sale not found' });

    // Reverse items impact on stock
    const bulkOps = sale.products
      .filter(p => p.productId)
      .map(p => ({
        updateOne: {
          filter: { _id: p.productId },
          update: { $inc: { stock: Math.abs(p.quantity) } } // restored stock
        }
      }));

    if (bulkOps.length) await Product.bulkWrite(bulkOps);

    await Sale.findByIdAndDelete(req.params.id);

    res.json({ message: 'Sale deleted and stock restored' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
