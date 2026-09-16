import React from 'react';

const NotificationPrefs = ({ data, onChange }) => (
  <div>
    <h6 className="fw-bold mb-4">Notification Preferences</h6>
    <div className="d-flex flex-column gap-3">
      <div className="d-flex align-items-center justify-content-between p-3 border rounded">
        <div>
          <div className="fw-bold">Low Stock Alerts</div>
          <div className="text-muted small">Notify when inventory falls below threshold</div>
        </div>
        <div className="form-check form-switch">
          <input className="form-check-input" type="checkbox" checked={data.lowStockAlert}
            onChange={e => onChange({...data, lowStockAlert: e.target.checked})} />
        </div>
      </div>
    </div>
  </div>
);

export default NotificationPrefs;
