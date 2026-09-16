import React from 'react';
import { ShoppingCart, Trash2, PlusCircle, Search } from 'lucide-react';

import SuggestionInput from '../common/SuggestionInput';

const CartPanel = ({ cart, registered = [], onAddQty, cust, onCustChange, onRemove, onNewCust }) => {
  return (
    <div className="w-100 h-100 d-flex flex-column">
      <div className="table-card h-100 d-flex flex-column border-0 shadow-sm">
        <div className="p-3 border-bottom bg-light bg-opacity-25 rounded-top">
          <div className="d-flex justify-content-between align-items-center mb-2 px-1">
            <span className="fw-bold text-dark small text-uppercase letter-spacing-1">Buyer Details</span>
            <button type="button" className="btn btn-primary btn-xs rounded-pill px-3 py-1 shadow-sm fw-bold" style={{ fontSize: '0.75rem' }} onClick={onNewCust}>
              <PlusCircle size={14} className="me-1" /> New
            </button>
          </div>
          <div className="row g-2">
            <div className="col-12">
              <SuggestionInput placeholder="Search Customer Name..." value={cust.name} 
                className="mb-2"
                onChange={v => onCustChange({ ...cust, name: v })}
                onSelect={c => onCustChange({ ...cust, name: c.name, phone: c.mobile })}
                options={React.useMemo(() => registered.map(r => ({ label: r.name, subText: r.mobile, data: r })), [registered])} />
              <SuggestionInput placeholder="Search Mobile..." value={cust.phone || ''}
                onChange={v => onCustChange({ ...cust, phone: v })}
                onSelect={c => onCustChange({ ...cust, name: c.name, phone: c.mobile })}
                options={React.useMemo(() => registered.map(r => ({ label: r.mobile, subText: r.name, data: r })), [registered])} />
            </div>
          </div>
        </div>
      <div className="p-3 bg-light bg-opacity-10 flex-grow-1" style={{ minHeight: '300px' }}>
        <div className="d-flex align-items-center gap-2 mb-3 fw-bold"><ShoppingCart size={18} /> Cart ({cart.length})</div>
        <div className="cart-items">{cart.length === 0 ? <div className="text-center py-5">Cart empty</div>
          : cart.map(i => (<div key={i.productId} className="cart-item-row mb-2">
              <div className="flex-grow-1">
                <div className="fw-bold small">{i.name}</div>
                <div className="d-flex align-items-center gap-1 extra-small">
                  <span className="fw-bold text-primary">₹{i.sellingPrice.toLocaleString()}</span>
                  {i.hasOffer && <span className="text-muted text-decoration-line-through">₹{i.originalPrice.toLocaleString()}</span>}
                  {i.offerLabel && <span className="badge bg-success-subtle text-success border border-success p-1" style={{ fontSize: '0.6rem' }}>{i.offerLabel}</span>}
                  <span className="text-muted">× {i.quantity}</span>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div className="qty-control d-flex border rounded"><button className="qty-btn" onClick={() => onAddQty(i.productId, -1)}>−</button><span className="qty-val px-2">{i.quantity}</span><button className="qty-btn" onClick={() => onAddQty(i.productId, 1)}>+</button></div>
                <button className="btn btn-icon text-danger p-1 border-0 bg-transparent" onClick={() => onRemove(i.productId)}><Trash2 size={15} /></button>
              </div>
            </div>))
        }</div></div></div></div>
  );
};

export default React.memo(CartPanel);
