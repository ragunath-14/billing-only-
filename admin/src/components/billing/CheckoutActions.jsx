import React from 'react';

const CheckoutActions = ({ billType, onType, method, onMethod, onCheckout, onQuick, loading, cartLen, pendingPayment, onPendingPaymentChange }) => (
  <div className="p-3 bg-light bg-opacity-25 rounded-bottom">
    <div className="d-flex gap-2 mb-3">
      <div className="flex-fill"><label className="fw-bold small text-muted mb-1 px-1">Bill Type</label>
        <div className="d-flex gap-1">
          {['GST', 'Non-GST'].map(t => <button key={t} className={`btn btn-xs flex-fill fw-bold py-2 ${billType === t ? 'btn-primary' : 'btn-light border text-muted'}`} style={{ fontSize: '0.75rem' }} onClick={() => onType(t)}>{t}</button>)}
        </div>
      </div>
      <div className="flex-fill"><label className="fw-bold small text-muted mb-1 px-1">Payment</label>
        <select className="form-select form-select-sm border-2 fw-bold" value={method} onChange={e => onMethod(e.target.value)}>
          <option value="Cash">Cash</option><option value="Card">Card</option><option value="UPI">UPI</option><option value="Credit">Credit</option></select>
      </div>
    </div>

    <div className="mb-3 p-2 border rounded-3 bg-white">
      <label className="d-flex align-items-center gap-2 fw-bold small mb-0" style={{ cursor: 'pointer' }}>
        <input
          type="checkbox"
          className="form-check-input m-0"
          checked={pendingPayment.enabled}
          onChange={e => onPendingPaymentChange({ ...pendingPayment, enabled: e.target.checked })}
        />
        Mark as Pending Payment
      </label>
      {pendingPayment.enabled && (
        <div className="mt-2">
          <label className="form-label small text-muted mb-1">Amount Paid Now (leave blank if nothing paid yet)</label>
          <input
            type="number"
            min="0"
            className="form-control form-control-sm"
            placeholder="0.00"
            value={pendingPayment.paidNow}
            onChange={e => onPendingPaymentChange({ ...pendingPayment, paidNow: e.target.value })}
          />
          <div className="text-muted extra-small mt-1" style={{ fontSize: '0.7rem' }}>
            The bill is still completed now — the balance due is tracked on the Pending Payments page under this customer.
          </div>
        </div>
      )}
    </div>

    <div className="d-flex gap-2">
      <button className="btn btn-outline-primary btn-lg flex-fill fw-bold py-3 shadow-xs border-dashed" onClick={onQuick} disabled={loading || cartLen === 0} style={{ borderStyle: 'dashed' }}>
        QUICK ENTRY
      </button>
      <button className="btn btn-primary btn-lg flex-grow-1 fw-bold py-3 shadow-sm" style={{ minWidth: '60%' }} onClick={onCheckout} disabled={loading || cartLen === 0}>
        {loading ? '...' : 'COMPLETE SALE'}
      </button>
    </div>
  </div>
);

export default CheckoutActions;
