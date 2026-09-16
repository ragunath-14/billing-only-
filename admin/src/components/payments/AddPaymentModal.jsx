import React from 'react';
import { User, Phone, IndianRupee, Save, X } from 'lucide-react';

const AddPaymentModal = ({ show, onClose, form, onChange, onSave }) => {
  if (!show) return null;
  
  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <form className="modal-content border-0 shadow-lg p-2" style={{ borderRadius: '1.25rem' }} onSubmit={(e) => { e.preventDefault(); onSave(); }}>
          <div className="modal-header border-0 pb-0">
            <h5 className="fw-bold mb-0">Record New Credit</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="text-muted small mb-1 d-flex align-items-center gap-1"><User size={14} /> Customer Name</label>
              <input required className="form-control" placeholder="Full name..." value={form.customerName} onChange={e => onChange({ ...form, customerName: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="text-muted small mb-1 d-flex align-items-center gap-1"><Phone size={14} /> Phone Number</label>
              <input required type="tel" className="form-control" placeholder="10-digit mobile..." value={form.customerPhone} onChange={e => onChange({ ...form, customerPhone: e.target.value })} />
            </div>
            <div className="mb-1">
              <label className="text-muted small mb-1 d-flex align-items-center gap-1"><IndianRupee size={14} /> Total Amount Due</label>
              <input required type="number" className="form-control form-control-lg fw-bold text-primary" placeholder="0.00" value={form.totalAmount} onChange={e => onChange({ ...form, totalAmount: e.target.value })} />
            </div>
          </div>
          <div className="modal-footer border-0 pt-0 pb-4 justify-content-center">
            <button type="submit" className="btn btn-primary w-100 mx-3 rounded-pill fw-bold shadow-sm py-2 d-flex align-items-center justify-content-center gap-2">
              <Save size={18} /> Add Credit Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPaymentModal;
