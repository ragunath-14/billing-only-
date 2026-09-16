import React, { useState } from 'react';
import { DollarSign, X } from 'lucide-react';

const PartialPaymentModal = ({ show, onClose, record, onSave }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [note, setNote] = useState('');

  if (!show || !record) return null;

  const remaining = record.totalAmount - record.paidAmount;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return alert('Enter valid amount');
    if (Number(amount) > remaining) return alert(`Amount cannot exceed remaining balance of ₹${remaining}`);
    onSave(record._id, { amount: Number(amount), method, note });
    setAmount('');
    setNote('');
  };

  return (
    <div className={`modal fade ${show ? 'show d-block' : ''}`} style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 shadow">
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="fw-bold mb-0">Record Partial Payment</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body py-4">
              <div className="bg-light p-3 rounded-4 mb-4">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted small">Customer</span>
                  <span className="fw-bold">{record.customerName}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted small">Total Due</span>
                  <span className="fw-bold">₹{record.totalAmount}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted small">Remaining</span>
                  <span className="fw-bold text-danger">₹{remaining}</span>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Payment Amount (₹)</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0"><DollarSign size={16} className="text-primary" /></span>
                  <input 
                    type="number" 
                    className="form-control border-start-0 ps-0" 
                    placeholder="Enter amount to pay..." 
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Payment Method</label>
                <select className="form-select bg-light border-0" value={method} onChange={e => setMethod(e.target.value)}>
                  <option>Cash</option>
                  <option>UPI / Online</option>
                  <option>Bank Transfer</option>
                </select>
              </div>

              <div className="mb-0">
                <label className="form-label small fw-bold">Internal Note (Optional)</label>
                <textarea 
                  className="form-control bg-light border-0" 
                  rows="2" 
                  placeholder="e.g. Paid by check #123"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="modal-footer border-top-0 pt-0 pb-4 px-4">
              <button type="button" className="btn btn-light rounded-pill px-4" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold">Confirm Payment</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PartialPaymentModal;
