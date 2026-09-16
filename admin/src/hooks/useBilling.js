import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useSettings } from '../context/SettingsContext';
import { calcFinalPrice } from '../utils/pricing';
import { API_URLS } from '../api/config';

export const useBilling = () => {
  const ap = API_URLS.PRODUCTS;
  const as = API_URLS.SALES;
  const ac = API_URLS.CUSTOMERS;
  const ay = API_URLS.PAYMENTS;
  const { settings } = useSettings();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [registered, setRegistered] = useState([]);
  const [cust, setCust] = useState({ name: '', phone: '', method: 'Cash' });
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState({ type: 'percentage', value: 0 });
  const [billType, setBillType] = useState('GST');
  const [cat, setCat] = useState('All');
  // Lets a cashier finish a bill (stock deducted, receipt printed) while the
  // customer still owes some or all of it — recorded on the Pending Payments page.
  const [pendingPayment, setPendingPayment] = useState({ enabled: false, paidNow: '' });

  const [lastSale, setLastSale] = useState(null);

  const f = useCallback(() => axios.get(ap).then(r => setProducts(r.data)), [ap]);
  const fCust = useCallback(() => axios.get(ac).then(r => setRegistered(r.data)), [ac]);

  useEffect(() => { f(); fCust(); }, [f, fCust]);

  const add = useCallback((p) => {
    if (p.stock <= 0) return alert('Out of stock!');
    const price = calcFinalPrice(p, settings);
    const ok = cart.find(i => i.productId === p._id);
    if (ok) {
      if (ok.quantity >= p.stock) return alert('No stock!');
      setCart(prev => prev.map(i => i.productId === p._id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart(prev => [...prev, { 
        productId: p._id, name: p.name, sellingPrice: price, buyingPrice: p.buyingPrice, 
        originalPrice: p.sellingPrice, hasOffer: p.hasOffer, offerLabel: p.offerLabel,
        quantity: 1 
      }]);
    }
  }, [cart, settings]);

  const qty = useCallback((id, d) => {
    const item = cart.find(i => i.productId === id);
    if (!item) return;
    const n = item.quantity + d;
    if (n <= 0) return setCart(prev => prev.filter(i => i.productId !== id));
    const p = products.find(px => px._id === id);
    if (p && n > p.stock) return alert('No stock!');
    setCart(prev => prev.map(i => i.productId === id ? { ...i, quantity: n } : i));
  }, [cart, products]);

  const checkout = useCallback(async (total, onlineOrderId = null) => {
    if (!cust.name) return alert('Customer Name is required!');
    if (!cust.phone || cust.phone.length < 10) return alert('Valid 10-digit Phone Number is required!');
    if (!cart.length) return alert('Cart is empty! Add products first.');
    setLoading(true);
    try {
      const rate = Number(settings.taxRate || 18);
      const taxRate = rate / 100;
      const subt = cart.reduce((a, i) => a + i.sellingPrice * i.quantity, 0);
      const dValue = discount.type === 'percentage' ? (subt * discount.value / 100) : discount.value;
      const taxable = subt - dValue;
      const gst = billType === 'GST' ? taxable * taxRate : 0;
      const totalAmount = Math.max(0, taxable + gst);
      const saleData = { 
        customerName: cust.name, customerPhone: cust.phone, paymentMethod: cust.method, 
        products: cart, totalAmount, billType, discount, gst, subt, taxRate: rate,
        onlineOrderId 
      };
      const res = await axios.post(as, saleData);

      if (pendingPayment.enabled) {
        const paidNow = Math.min(Math.max(Number(pendingPayment.paidNow) || 0, 0), totalAmount);
        const status = paidNow <= 0 ? 'Pending' : paidNow >= totalAmount ? 'Completed' : 'Partial';
        try {
          await axios.post(ay, {
            customerName: cust.name, customerPhone: cust.phone, totalAmount,
            paidAmount: paidNow, status,
            history: paidNow > 0 ? [{ amount: paidNow, method: cust.method, note: `Billing #${res.data._id}` }] : [],
          });
        } catch (payErr) {
          alert('Sale was completed, but the pending payment record failed to save: ' + (payErr.response?.data?.error || payErr.message));
        }
      }

      setLastSale(res.data); setCart([]); setCust({ name: '', phone: '', method: 'Cash' }); setDiscount({ type: 'percentage', value: 0 }); setPendingPayment({ enabled: false, paidNow: '' }); f();
    } catch (err) {
      alert('Sale failed: ' + (err.response?.data?.error || err.message));
    } finally { setLoading(false); }
  }, [as, ay, billType, cart, cust, discount, f, pendingPayment, settings.taxRate]);

  const quick = useCallback(async (total) => {
    if (!cart.length) return alert('Cart is empty!');
    setLoading(true);
    try {
      const rate = Number(settings.taxRate || 18);
      const taxRate = rate / 100;
      const gCust = { name: 'Counter Customer', phone: '0000000000', method: cust.method };
      const subt = cart.reduce((a, i) => a + i.sellingPrice * i.quantity, 0);
      const dValue = discount.type === 'percentage' ? (subt * discount.value / 100) : discount.value;
      const taxable = subt - dValue;
      const gst = billType === 'GST' ? taxable * taxRate : 0;
      const saleData = { 
        customerName: gCust.name, customerPhone: gCust.phone, paymentMethod: gCust.method, 
        products: cart, totalAmount: taxable + gst, billType, discount, gst, subt, taxRate: rate 
      };
      const res = await axios.post(as, saleData);
      setLastSale(res.data); setCart([]); setCust({ name: '', phone: '', method: 'Cash' }); setDiscount({ type: 'percentage', value: 0 }); f();
    } catch (err) {
      alert('Quick Sale failed: ' + (err.response?.data?.error || err.message));
    } finally { setLoading(false); }
  }, [as, billType, cart, cust.method, discount, f, settings.taxRate]);

  const regCust = useCallback(async (data) => {
    try {
      const res = await axios.post(ac, { name: data.name, mobile: data.mobile });
      setRegistered(prev => [...prev, res.data]);
      setCust(prev => ({ ...prev, name: res.data.name, phone: res.data.mobile }));
      return res.data;
    } catch (err) { alert('Failed to register: ' + (err.response?.data?.error || err.message)); }
  }, [ac]);

  const deleteSale = useCallback(async (id) => {
    if (!id) return;
    try {
      await axios.delete(`${as}/${id}`);
      f(); // Refresh products
      setLastSale(null);
      alert('Sale deleted and stock restored.');
    } catch (err) { alert('Failed to delete sale'); }
  }, [as, f]);

  const prefill = useCallback((data) => {
    if (data.customerInfo) {
      setCust({ 
        name: data.customerInfo.name || '', 
        phone: data.customerInfo.phone || '', 
        method: 'Cash' 
      });
    }
    if (data.prefillItems) {
      setCart(data.prefillItems.map(item => ({
        productId: item._id,
        name: item.name,
        sellingPrice: item.sellingPrice,
        quantity: item.qty,
        buyingPrice: 0,
        originalPrice: item.sellingPrice,
        outOfStock: item.outOfStock || false
      })));
    }
  }, []);

  const value = useMemo(() => ({
    products, search, setSearch, cart, setCart, registered, cust, setCust,
    loading, discount, setDiscount, billType, setBillType, cat, setCat,
    pendingPayment, setPendingPayment,
    add, qty, checkout, quick, regCust, lastSale, setLastSale, f, deleteSale, prefill
  }), [products, search, cart, registered, cust, loading, discount, billType, cat, pendingPayment, add, qty, checkout, quick, regCust, lastSale, f, deleteSale, prefill]);

  return value;
};
