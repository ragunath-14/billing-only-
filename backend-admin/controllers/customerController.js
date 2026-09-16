const Customer = require('../models/Customer');

exports.getCustomers = async (req, res) => {
  try { res.json(await Customer.find().sort({ name: 1 }).lean()); } 
  catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

exports.createCustomer = async (req, res) => {
  try {
    const { name, mobile } = req.body;
    let existing = await Customer.findOne({ mobile });
    if (existing) {
      return res.status(400).json({ error: 'Customer already exists with this mobile number.' });
    }
    const c = new Customer({ name, mobile }); 
    await c.save();
    res.status(201).json(c);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.updateCustomer = async (req, res) => {
    try {
      const { name, mobile } = req.body;
      const c = await Customer.findByIdAndUpdate(req.params.id, { name, mobile }, { new: true });
      res.json(c);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.deleteCustomer = async (req, res) => {
    try { await Customer.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
    catch (err) { res.status(400).json({ error: err.message }); }
};
