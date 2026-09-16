import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useBilling } from '../hooks/useBilling';
import { useSettings } from '../context/SettingsContext';
import ProductCatalog from '../components/billing/ProductCatalog';
import CartPanel from '../components/billing/CartPanel';
import BillingSummary from '../components/billing/BillingSummary';
import CheckoutActions from '../components/billing/CheckoutActions';
import ReceiptModal from '../components/billing/ReceiptModal';
import AddCustomerModal from '../components/customers/AddCustomerModal';
import BillDiscountModal from '../components/billing/BillDiscountModal';

const Billing = () => {
  const b = useBilling();
  const location = useLocation();
  const { settings } = useSettings();
  const [showCustModal, setShowCustModal] = React.useState(false);
  const [showDiscModal, setShowDiscModal] = React.useState(false);
  const [custForm, setCustForm] = React.useState({ name: '', mobile: '' });
  
  // Handle pre-fill from Online Orders
  useEffect(() => {
    if (location.state && (location.state.prefillItems || location.state.customerInfo)) {
      b.prefill(location.state);
      // Clear location state to prevent re-filling on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, b.prefill]);

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
        <ProductCatalog search={b.search} onSearch={b.setSearch} cat={b.cat} onCat={b.setCat} filtered={fs} allProducts={b.products} onAdd={b.add} settings={settings} />
        <div className="col-lg-6 h-100">
          <div className="table-card h-100 d-flex flex-column cart-panel-mobile">
            <CartPanel cart={b.cart} registered={b.registered} onAddQty={b.qty} cust={b.cust} onCustChange={b.setCust} onRemove={(id) => b.setCart(b.cart.filter(i => i.productId !== id))} onNewCust={() => setShowCustModal(true)} />
            <div className="mt-auto px-2">
              <BillingSummary subt={subt} disc={b.discount} onDisc={() => setShowDiscModal(true)} gst={gst} total={total} />
              <CheckoutActions billType={b.billType} onType={b.setBillType} method={b.cust.method} onMethod={(m) => b.setCust({ ...b.cust, method: m })} onCheckout={() => b.checkout(total)} onQuick={() => b.quick(total)} loading={b.loading} cartLen={b.cart.length} pendingPayment={b.pendingPayment} onPendingPaymentChange={b.setPendingPayment} />
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
