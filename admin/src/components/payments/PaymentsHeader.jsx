import React from 'react';
import { Plus } from 'lucide-react';

const PaymentsHeader = ({ onAdd }) => (
  <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-4">
    <div><h5 className="fw-bold mb-1">Pending Payments</h5><p className="text-muted small">Track customer dues</p></div>
    <button className="btn btn-primary d-flex align-items-center justify-content-center gap-2 align-self-start" onClick={onAdd}><Plus size={18} /> Add New</button>
  </div>
);

export default PaymentsHeader;
