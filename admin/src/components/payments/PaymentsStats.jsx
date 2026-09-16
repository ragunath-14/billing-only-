import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const PaymentsStats = ({ pendingAmt, completedCount }) => {
  const cards = [
    { label: 'Total Outstanding Balance', v: `₹${pendingAmt.toLocaleString()}`, i: <AlertCircle />, c: '#fee2e2', ic: '#ef4444' },
    { label: 'Fully Settled Records', v: completedCount, i: <CheckCircle2 />, c: '#dcfce7', ic: '#22c55e' },
  ];
  return (
    <div className="row g-3 mb-4">{cards.map((s, i) => (
      <div className="col-12 col-md-6" key={i}>
        <div className="stat-card h-100"><div className="stat-icon" style={{ background: s.c }}><span style={{ color: s.ic }}>{s.i}</span></div>
          <div><div className="stat-value">{s.v}</div><div className="stat-label small">{s.label}</div></div></div></div>))}
    </div>
  );
};

export default PaymentsStats;
