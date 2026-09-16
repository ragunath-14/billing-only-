import React from 'react';
import { Package, ShoppingBag, AlertTriangle, IndianRupee } from 'lucide-react';

const DashboardStats = ({ stats }) => {
  const cards = [
    { label: 'Total Products', v: stats.totalProducts || 0, i: <Package />, c: '#dbeafe', ic: '#2563eb' },
    { label: 'Total Sales', v: stats.totalSales || 0, i: <ShoppingBag />, c: '#dcfce7', ic: '#16a34a' },
    { label: 'Low Stock', v: stats.lowStock || 0, i: <AlertTriangle />, c: '#fee2e2', ic: '#dc2626' },
    { label: 'Revenue', v: `₹${Math.max(0, stats.revenue || 0).toLocaleString('en-IN')}`, i: <IndianRupee />, c: '#fef9c3', ic: '#ca8a04' },
  ];
  return (
    <div className="row g-3 mb-4">{cards.map((c, idx) => (
      <div className="col-sm-6 col-xl-3" key={idx}>
        <div className="stat-card"><div className="stat-icon" style={{ background: c.c }}><span style={{ color: c.ic }}>{c.i}</span></div>
          <div><div className="stat-label small">{c.label}</div><div className="stat-value">{c.v}</div></div></div></div>))}
    </div>
  );
};

export default DashboardStats;
