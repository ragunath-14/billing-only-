import React from 'react';
import { Plus, FileSpreadsheet } from 'lucide-react';
import { exportToExcel } from '../../utils/exportExcel';

const handleExport = (customers, sales) => {
  const rows = customers.map(c => {
    const custSales = sales.filter(s => s.customerPhone === c.mobile);
    return {
      'Name': c.name,
      'Mobile': c.mobile,
      'Total Orders': custSales.length,
      'Total Spent': custSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
      'Joined': c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '',
    };
  });
  exportToExcel(`Customers_${new Date().toISOString().split('T')[0]}.xlsx`, 'Customers', rows);
};

const CustomerHeader = ({ onAdd, customers = [], sales = [] }) => (
  <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-4">
    <div><h5 className="fw-bold mb-1">Customer Management</h5><p className="text-muted small mb-0">Maintain your directory</p></div>
    <div className="d-flex gap-2 align-self-start">
      <button className="btn btn-light border shadow-sm d-flex align-items-center justify-content-center gap-2" onClick={() => handleExport(customers, sales)}>
        <FileSpreadsheet size={18} /> Export Excel</button>
      <button className="btn btn-primary d-flex align-items-center justify-content-center gap-2" onClick={onAdd}>
        <Plus size={18} /> Add Customer</button>
    </div>
  </div>
);

export default CustomerHeader;
