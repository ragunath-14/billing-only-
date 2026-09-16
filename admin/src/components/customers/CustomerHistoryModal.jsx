import React from 'react';
import { History, X, ShoppingBag, Calendar, IndianRupee } from 'lucide-react';

const CustomerHistoryModal = ({ show, onClose, customer, sales = [] }) => {
  if (!show || !customer) return null;
  
  const h = sales.filter(s => s.customerPhone === customer.mobile || s.customerName === customer.name);

  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '1.5rem' }}>
          <div className="modal-header border-bottom p-4">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary bg-opacity-10 p-2 rounded-circle"><History className="text-primary" size={24} /></div>
              <div><h5 className="fw-bold mb-0">Purchase History: {customer.name}</h5><p className="text-muted small mb-0">{customer.mobile}</p></div>
            </div>
            <button className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body p-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {h.length === 0 ? <div className="py-5 text-center text-muted"><ShoppingBag size={48} className="mb-3 opacity-25" /><h6>No purchase history found for this buyer.</h6></div>
              : <div className="table-responsive">
                <table className="table align-middle">
                  <thead className="table-light"><tr><th className="extra-small ps-3 fw-bold">DATE</th><th className="extra-small fw-bold">ITEMS BOUGHT</th><th className="extra-small fw-bold">BILL TYPE</th><th className="extra-small text-end pe-3 fw-bold">TOTAL PAID</th></tr></thead>
                  <tbody>{h.map((s, idx) => (
                    <tr key={idx}>
                      <td className="ps-3"><div className="d-flex align-items-center gap-2 small"><Calendar size={13} className="text-muted" />{new Date(s.createdAt).toLocaleDateString()}</div></td>
                      <td><div className="extra-small text-muted">{s.products.map(p => `${p.name} (x${p.quantity})`).join(', ')}</div></td>
                      <td><span className={`badge rounded-pill extra-small ${s.billType === 'GST' ? 'bg-primary-subtle text-primary border border-primary px-2' : 'bg-light text-dark border px-2'}`}>{s.billType}</span></td>
                      <td className="text-end pe-3 fw-bold text-primary">₹{s.totalAmount.toLocaleString('en-IN')}</td>
                    </tr>))}</tbody></table>
              </div>
            }
          </div>
          <div className="modal-footer border-top p-3 justify-content-center">
            <button className="btn btn-light rounded-pill px-5 fw-bold" onClick={onClose}>Close History View</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerHistoryModal;
