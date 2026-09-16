const Order = require('../models/Order');
const Product = require('../models/Product');

// Create a new order (from Shop)
exports.createOrder = async (req, res) => {
  try {
    const items = req.body.items || [];
    const productIds = items.map(i => i.productId).filter(Boolean);
    const products = await Product.find({ _id: { $in: productIds } }).select('stock').lean();
    const stockById = new Map(products.map(p => [p._id.toString(), p.stock]));

    const itemsWithStockFlag = items.map(item => {
      const stock = stockById.get(String(item.productId));
      return { ...item, outOfStock: stock === undefined ? false : item.qty > stock };
    });

    const order = new Order({ ...req.body, items: itemsWithStockFlag });
    const saved = await order.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all orders (for Admin)
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single order
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
