import React from 'react';
import { useSettings } from '../../context/SettingsContext';

const BillingSummary = ({ subt, disc, onDisc, gst, total }) => {
  const { settings } = useSettings();
  return (
    <div className="p-3 border-top border-bottom bg-light bg-opacity-10">
      <div className="d-flex justify-content-between mb-2 small"><span className="text-muted small">Cart Subtotal</span><span className="fw-bold">₹{subt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
      <div className="mb-3 py-2 px-3 rounded bg-white hover-shadow transition-all" style={{ cursor: 'pointer', border: '1px dashed #2563eb' }} onClick={onDisc}>
        <div className="d-flex justify-content-between align-items-center">
          <span className="text-muted small">Overall Bill Discount</span>
          <div className="d-flex align-items-center gap-2">
            {disc.value > 0 && <span className="badge bg-danger rounded-pill px-2">-{disc.type === 'percentage' ? `${disc.value}%` : `₹${disc.value}`}</span>}
            <span className="text-primary fw-bold" style={{ fontSize: '0.8rem' }}>{disc.value > 0 ? 'Edit' : 'Add Discount'}</span>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-between mb-2 small">
        <span className="text-muted small">GST ({settings.taxRate || 18}%)</span>
        <span className="fw-bold">₹{gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>
      <div className="d-flex justify-content-between align-items-center border-top pt-2"><span className="fw-bold text-dark h6 mb-0">Grand Total</span>
        <span className="fw-bold text-primary h4 mb-0">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
    </div>
  );
};

export default BillingSummary;
