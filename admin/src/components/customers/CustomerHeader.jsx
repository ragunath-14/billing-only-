import React from 'react';
import { Plus } from 'lucide-react';

const CustomerHeader = ({ onAdd }) => (
  <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-4">
    <div><h5 className="fw-bold mb-1">Customer Management</h5><p className="text-muted small mb-0">Maintain your directory</p></div>
    <button className="btn btn-primary d-flex align-items-center justify-content-center gap-2 align-self-start" onClick={onAdd}>
      <Plus size={18} /> Add Customer</button>
  </div>
);

export default CustomerHeader;
