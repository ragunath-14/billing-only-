import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

const BillDiscountModal = ({ show, onClose, currentDisc, onSave }) => {
  const [type, setType] = useState(currentDisc?.type || 'percentage');
  const [val, setVal] = useState(currentDisc?.value || 0);

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
      <div className="modal-dialog modal-sm modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '1.25rem' }}>
          <div className="modal-header border-0 pb-0">
            <h6 className="fw-bold mb-0">Bill Discount</h6>
            <button className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <div className="btn-group w-100 mb-3 p-1 bg-light rounded-pill">
              <button className={`btn btn-sm rounded-pill fw-bold ${type === 'percentage' ? 'btn-primary shadow-sm' : 'btn-light border-0'}`} onClick={() => setType('percentage')}>Percentage</button>
              <button className={`btn btn-sm rounded-pill fw-bold ${type === 'amount' ? 'btn-primary shadow-sm' : 'btn-light border-0'}`} onClick={() => setType('amount')}>Amount</button>
            </div>
            
            <label className="text-muted small mb-1">{type === 'percentage' ? 'Discount (%)' : 'Discount (₹)'}</label>
            <div className="input-group">
              <input type="number" className="form-control form-control-lg fw-bold text-center border-primary text-primary" 
                value={val} onChange={e => setVal(Number(e.target.value))} autoFocus />
              <span className="input-group-text bg-primary text-white border-primary fw-bold text-lg">{type === 'percentage' ? '%' : '₹'}</span>
            </div>
            
            {type === 'percentage' && (
              <div className="mt-3 d-flex gap-2">
                {[5, 10, 15, 20].map(p => (
                  <button key={p} className={`btn btn-sm flex-fill ${val === p ? 'btn-primary' : 'btn-outline-secondary opacity-75'}`} 
                    onClick={() => setVal(p)} style={{ fontSize: '0.75rem' }}>{p}%</button>
                ))}
              </div>
            )}
          </div>
          <div className="modal-footer border-0 pt-0 pb-4 justify-content-center">
            <button className="btn btn-primary w-100 mx-3 rounded-pill fw-bold shadow-sm py-2" 
              onClick={() => { onSave({ type, value: val }); onClose(); }}>
              Apply Discount
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillDiscountModal;
