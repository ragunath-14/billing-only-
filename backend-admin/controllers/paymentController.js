const Payment = require('../models/Payment');

exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 }).lean();
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createPayment = async (req, res) => {
  try {
    const p = new Payment(req.body);
    await p.save();
    res.status(201).json(p);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.addPartialPayment = async (req, res) => {
  try {
    const { amount, method, note } = req.body;
    const p = await Payment.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Record not found' });

    p.paidAmount += Number(amount);
    p.history.push({ amount, method, note });
    
    if (p.paidAmount >= p.totalAmount) p.status = 'Completed';
    else if (p.paidAmount > 0) p.status = 'Partial';
    
    await p.save();
    res.json(p);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
