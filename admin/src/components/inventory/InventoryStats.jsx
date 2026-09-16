import React from 'react';

const InventoryStats = ({ totalStock, totalStockValue, lowCount }) => {
  const cards = [
    { label: 'Total Units', value: totalStock, gradient: 'linear-gradient(135deg,#2563eb,#60a5fa)' },
    { label: 'Total Value', value: `₹${(totalStockValue || 0).toLocaleString('en-IN')}`, gradient: 'linear-gradient(135deg,#16a34a,#4ade80)' },
    { label: 'Low Stock',  value: lowCount, gradient: 'linear-gradient(135deg,#d97706,#fbbf24)' },
  ];
  return (
    <div className="row g-3 mb-4">
      {cards.map((c, i) => (
        <div className="col-md-4" key={i}>
          <div className="inv-card" style={{ background: c.gradient }}>
            <div className="inv-card-value">{c.value}</div>
            <div className="inv-card-label">{c.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryStats;
