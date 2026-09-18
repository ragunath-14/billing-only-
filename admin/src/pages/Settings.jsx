import React, { useState } from 'react';
import { Store, CreditCard, Bell, CheckCircle2, Percent, Printer } from 'lucide-react';
import ShopInformation from '../components/settings/ShopInformation';
import BillingConfig from '../components/settings/BillingConfig';
import NotificationPrefs from '../components/settings/NotificationPrefs';
import GlobalDiscount from '../components/settings/GlobalDiscount';
import PrintSettings from '../components/settings/PrintSettings';

import { useSettings } from '../context/SettingsContext';
import axios from 'axios';
import { API_URLS } from '../api/config';

const Settings = () => {
  const { settings, setSettings, refreshSettings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState('shop');

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const { _id, __v, createdAt: _createdAt, updatedAt: _updatedAt, ...payload } = settings;
      await axios.post(API_URLS.SETTINGS, payload);
      setSaved(true); 
      refreshSettings();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { alert('Failed to save settings: ' + (err.response?.data?.error || err.message)); }
    finally { setLoading(false); }
  };

  const tabs = [
    { id: 'shop', label: 'Shop Details', icon: <Store size={16} /> },
    { id: 'billing', label: 'Billing & GST', icon: <CreditCard size={16} /> },
    { id: 'discount', label: 'Global Discount', icon: <Percent size={16} /> },
    { id: 'print', label: 'Print & Receipt', icon: <Printer size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
  ];

  return (
    <div className="settings-page">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h5 className="fw-bold mb-1">General Settings</h5>
          <p className="text-muted small mb-0">Configure your shop preferences</p>
        </div>
        {saved && <div className="alert alert-success p-2 small mb-0 d-flex align-items-center gap-2"><CheckCircle2 size={16} /> Settings saved!</div>}
      </div>
      <div className="row">
        <div className="col-md-3 mb-3 mb-md-0">
          <div className="table-card p-1 p-md-2 d-flex flex-row flex-md-column gap-1 overflow-auto no-scrollbar">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`btn d-flex align-items-center gap-2 gap-md-3 text-nowrap p-2 p-md-3 flex-fill ${tab === t.id ? 'btn-primary shadow-sm' : 'btn-light border-0'}`}>
                {t.icon} <span className="small fw-bold">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="col-md-9">
          <div className="table-card p-4">
            {tab === 'shop' && <ShopInformation data={settings} onChange={setSettings} onSave={handleSave} loading={loading} />}
            {tab === 'billing' && <BillingConfig data={settings} onChange={setSettings} onSave={handleSave} loading={loading} />}
            {tab === 'discount' && <GlobalDiscount data={settings} onChange={setSettings} onSave={handleSave} loading={loading} />}
            {tab === 'print' && <PrintSettings data={settings} onChange={setSettings} onSave={handleSave} loading={loading} />}
            {tab === 'notifications' && <NotificationPrefs data={settings} onChange={setSettings} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
