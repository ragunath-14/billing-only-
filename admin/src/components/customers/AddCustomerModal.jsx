import React from 'react';

const AddCustomerModal = ({ show, onClose, form, onChange, onSave }) => {
  if (!show) return null;
  return (<div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog modal-dialog-centered modal-sm"><div className="modal-content shadow-lg border-0">
      <div className="modal-header border-bottom-0 pb-0"><h6 className="modal-title fw-bold">Add Customer</h6><button className="btn-close" onClick={onClose} /></div>
      <form onSubmit={onSave}><div className="modal-body pt-3">
        <label className="form-label mb-1 small text-muted fw-bold">Name *</label><input required className="form-control mb-3 border-2" value={form.name} onChange={e => onChange({ ...form, name: e.target.value })} />
        <label className="form-label mb-1 small text-muted fw-bold">Mobile *</label>
        <div className="input-group border-2 shadow-sm rounded-3 overflow-hidden"><span className="input-group-text bg-light border-0 small fw-bold text-muted">+91</span>
          <input required type="tel" pattern="[0-9]{10}" className="form-control border-0" placeholder="10-digit number" value={form.mobile} onChange={e => onChange({ ...form, mobile: e.target.value })} /></div>
      </div><div className="modal-footer border-top-0 pt-0 pb-4 justify-content-center">
        <button type="button" className="btn btn-light px-4" onClick={onClose}>Cancel</button><button type="submit" className="btn btn-primary px-4 fw-bold">Save</button></div>
      </form></div></div></div>);
};

export default AddCustomerModal;
