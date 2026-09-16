import React from 'react';
import { Save, Percent } from 'lucide-react';

const GlobalDiscount = ({ data, onChange, onSave, loading }) => {
  const gd = data.globalDiscount || { enabled: false, type: 'percentage', value: 0 };
  const setGd = (patch) => onChange({ ...data, globalDiscount: { ...gd, ...patch } });

  return (
    <form onSubmit={onSave}>
      <h6 className="fw-bold mb-1">Global Discount</h6>
      <p className="text-muted small mb-4">
        When enabled, this discount is applied automatically to every product's selling price —
        across the online store, billing counter and inventory — instead of any individual product offer.
      </p>

      <div className="form-check form-switch mb-4">
        <input
          className="form-check-input" type="checkbox" role="switch" id="globalDiscountEnabled"
          checked={!!gd.enabled}
          onChange={e => setGd({ enabled: e.target.checked })}
        />
        <label className="form-check-label fw-bold" htmlFor="globalDiscountEnabled">
          Apply a discount to all products
        </label>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <label className="form-label">Discount Type</label>
          <select className="form-select" value={gd.type} disabled={!gd.enabled}
            onChange={e => setGd({ type: e.target.value })}>
            <option value="percentage">Percentage (%)</option>
            <option value="flat">Flat Amount (₹)</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Discount Value</label>
          <div className="input-group">
            <span className="input-group-text"><Percent size={14} /></span>
            <input
              type="number" min="0" className="form-control" disabled={!gd.enabled}
              value={gd.value}
              onChange={e => setGd({ value: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-5">
        <button type="submit" className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm" disabled={loading}>
          {loading ? <div className="spinner-border spinner-border-sm" /> : <Save size={16} />}
          <span>Save Configuration</span>
        </button>
      </div>
    </form>
  );
};

export default GlobalDiscount;
