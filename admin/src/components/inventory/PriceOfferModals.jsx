import React from 'react';

export const PriceModal = ({ show, name, form, onChange, onSave, onClose }) => {
  if (!show) return null;
  return (<div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.45)' }}>
    <div className="modal-dialog modal-dialog-centered modal-sm"><div className="modal-content">
      <div className="modal-header"><h6 className="modal-title">Update Price</h6><button className="btn-close" onClick={onClose} /></div>
      <form onSubmit={onSave}><div className="modal-body"><p className="text-muted small mb-3">{name}</p>
        <div className="mb-3"><label className="form-label">Cost Price (₹)</label><input type="number" required className="form-control" value={form.buyingPrice} onChange={e => onChange({ ...form, buyingPrice: e.target.value })} /></div>
        <div><label className="form-label">Selling Price (₹)</label><input type="number" required className="form-control" value={form.sellingPrice} onChange={e => onChange({ ...form, sellingPrice: e.target.value })} /></div>
      </div><div className="modal-footer"><button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-success">Save Price</button></div></form></div></div></div>);
};

export const OfferModal = ({ show, name, form, onChange, onSave, onRemove, onClose }) => {
  if (!show) return null;
  return (<div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.45)' }}>
    <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
      <div className="modal-header"><h6 className="modal-title">🏷 Manage Offer — {name}</h6><button className="btn-close" onClick={onClose} /></div>
      <form onSubmit={onSave}><div className="modal-body"><div className="row g-3">
        <div className="col-12"><label className="form-label">Offer Label</label><input className="form-control" value={form.offerLabel} onChange={e => onChange({ ...form, offerLabel: e.target.value })} /></div>
        <div className="col-6"><label className="form-label">Discount Type</label><select className="form-select" value={form.discountType} onChange={e => onChange({ ...form, discountType: e.target.value })}>
          <option value="percentage">Percentage (%)</option><option value="flat">Flat Amount (₹)</option></select></div>
        <div className="col-6"><label className="form-label">Discount Value</label><input required type="number" className="form-control" value={form.discountValue} onChange={e => onChange({ ...form, discountValue: e.target.value })} /></div>
      </div></div><div className="modal-footer"><button type="button" className="btn btn-outline-danger me-auto" onClick={onRemove}>Remove Offer</button>
        <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button><button type="submit" className="btn btn-warning text-white">Apply Offer</button></div></form></div></div></div>);
};
