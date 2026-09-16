import React from 'react';
import axios from 'axios';
import { useBilling } from '../hooks/useBilling';
import { useSettings } from '../context/SettingsContext';
import { API_URLS } from '../api/config';
import ProductCatalog from '../components/billing/ProductCatalog';
import CartPanel from '../components/billing/CartPanel';
import BillingSummary from '../components/billing/BillingSummary';
import CheckoutActions from '../components/billing/CheckoutActions';
import ReceiptModal from '../components/billing/ReceiptModal';
import AddCustomerModal from '../components/customers/AddCustomerModal';
import BillDiscountModal from '../components/billing/BillDiscountModal';

const Billing = () => {
  const b = useBilling();
  const { settings } = useSettings();
  const [showCustModal, setShowCustModal] = React.useState(false);
  const [showDiscModal, setShowDiscModal] = React.useState(false);
  const [custForm, setCustForm] = React.useState({ name: '', mobile: '' });
  const [categories, setCategories] = React.useState([]);

  React.useEffect(() => {
    axios.get(`${API_URLS.BASE}/categories`).then(r => setCategories(r.data)).catch(() => {});
  }, []);

  const fs = React.useMemo(() => {
    const q = b.search.toLowerCase();
    return b.products.filter(p => 
      (p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)) && 
      (b.cat === 'All' || p.category === b.cat)
    );
  }, [b.products, b.search, b.cat]);

  const subt = React.useMemo(() => 
    b.cart.reduce((a, i) => a + i.sellingPrice * i.quantity, 0),
  [b.cart]);

  const dVal = React.useMemo(() => 
    b.discount.type === 'percentage' ? (subt * b.discount.value / 100) : b.discount.value,
  [subt, b.discount]);

  const taxable = subt - dVal;
  const taxRate = Number(settings.taxRate || 18) / 100;
  const gst = b.billType === 'GST' ? taxable * taxRate : 0;
  const total = Math.max(0, taxable + gst);

  const saveCust = async (e) => {
    e.preventDefault();
    await b.regCust(custForm);
    setShowCustModal(false); 
    setCustForm({ name: '', mobile: '' });
  };

  return (
    <div className="container-fluid p-0">
      <div className="row g-4 h-100 billing-row">
        <ProductCatalog search={b.search} onSearch={b.setSearch} cat={b.cat} onCat={b.setCat} filtered={fs} allProducts={b.products} categories={categories} onAdd={b.add} settings={settings} />
        <div className="col-lg-6 h-100">
          <div className="table-card h-100 d-flex flex-column cart-panel-mobile">
            {b.banner && (
              <div className={`alert ${b.banner.type === 'success' ? 'alert-success' : 'alert-danger'} d-flex align-items-center justify-content-between gap-2 shadow-sm border-0 rounded-0 mb-0 py-2 px-3 small`}>
                <span>{b.banner.text}</span>
                <button type="button" className="btn-close" style={{ fontSize: '0.7rem' }} onClick={() => b.setBanner(null)} />
              </div>
            )}
            <CartPanel cart={b.cart} registered={b.registered} onAddQty={b.qty} cust={b.cust} onCustChange={b.setCust} onRemove={(id) => b.setCart(b.cart.filter(i => i.productId !== id))} onNewCust={() => setShowCustModal(true)} />
            <div className="mt-auto px-2">
              <BillingSummary subt={subt} disc={b.discount} onDisc={() => setShowDiscModal(true)} gst={gst} total={total} />
              <CheckoutActions billType={b.billType} onType={b.setBillType} method={b.cust.method} onMethod={(m) => b.setCust({ ...b.cust, method: m })} onCheckout={() => b.checkout(total)} onQuick={() => b.quick(total)} loading={b.loading} pendingPayment={b.pendingPayment} onPendingPaymentChange={b.setPendingPayment} />
            </div>
          </div>
        </div>
      </div>
      <ReceiptModal show={!!b.lastSale} sale={b.lastSale} onClose={() => b.setLastSale(null)} onDelete={b.deleteSale} />
      <AddCustomerModal show={showCustModal} onClose={() => setShowCustModal(false)} form={custForm} onChange={setCustForm} onSave={saveCust} />
      <BillDiscountModal show={showDiscModal} onClose={() => setShowDiscModal(false)} currentDisc={b.discount} onSave={b.setDiscount} />
    </div>
  );
};

export default Billing;
