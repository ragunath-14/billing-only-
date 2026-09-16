import React from 'react';
import { Save } from 'lucide-react';

const BillingConfig = ({ data, onChange, onSave, loading }) => (
  <form onSubmit={onSave}>
    <h6 className="fw-bold mb-4">Billing & GST Configuration</h6>
    <div className="row g-4">
      <div className="col-md-6">
        <label className="form-label">GSTIN Number</label>
        <input className="form-control" value={data.gstin}
          onChange={e => onChange({...data, gstin: e.target.value})} />
      </div>
      <div className="col-md-6">
        <label className="form-label">Default GST Tax Rate (%)</label>
        <input type="number" className="form-control" value={data.taxRate}
          onChange={e => onChange({...data, taxRate: e.target.value})} />
      </div>
      <div className="col-md-6">
        <label className="form-label">Currency Symbol</label>
        <select className="form-select" value={data.currency}
          onChange={e => onChange({...data, currency: e.target.value})}>
          <option value="INR">INR (₹)</option>
          <option value="USD">USD ($)</option>
        </select>
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

export default BillingConfig;
