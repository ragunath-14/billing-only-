import React from 'react';
import { Store, Phone, MapPin, Mail, X, Save } from 'lucide-react';

const ShopInformation = ({ data, onChange, onSave, loading }) => (
  <form onSubmit={onSave}>
    <h6 className="fw-bold mb-4">Shop Information</h6>
    <div className="row g-4">
      <div className="col-md-6">
        <label className="form-label">Shop Name</label>
        <div className="input-group">
          <span className="input-group-text bg-light border-end-0"><Store size={16} /></span>
          <input className="form-control border-start-0" value={data.shopName}
            onChange={e => onChange({...data, shopName: e.target.value})} />
        </div>
      </div>
      <div className="col-md-6">
        <label className="form-label">Phone Number</label>
        <div className="input-group">
          <span className="input-group-text bg-light border-end-0"><Phone size={16} /></span>
          <input className="form-control border-start-0" value={data.phone}
            onChange={e => onChange({...data, phone: e.target.value})} />
        </div>
      </div>
      <div className="col-md-12">
        <label className="form-label">Address</label>
        <div className="input-group">
          <span className="input-group-text bg-light border-end-0"><MapPin size={16} /></span>
          <input className="form-control border-start-0" value={data.address}
            onChange={e => onChange({...data, address: e.target.value})} />
        </div>
      </div>
      <div className="col-md-6">
        <label className="form-label">Email Address</label>
        <div className="input-group">
          <span className="input-group-text bg-light border-end-0"><Mail size={16} /></span>
          <input className="form-control border-start-0" value={data.email}
            onChange={e => onChange({...data, email: e.target.value})} />
        </div>
      </div>
    </div>
    <hr className="my-5 opacity-10" />
    <div className="d-flex justify-content-end gap-2">
      <button type="button" className="btn btn-light d-flex align-items-center gap-2"><X size={16} /> Reset</button>
      <button type="submit" className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm" disabled={loading}>
        {loading ? <div className="spinner-border spinner-border-sm" /> : <Save size={16} />}
        <span>Save Settings</span>
      </button>
    </div>
  </form>
);

export default ShopInformation;
