import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

import { API_URLS } from '../api/config';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    shopName: 'Sparkle Crackers Hub',
    address: '123 Firework Lane, Sivakasi',
    phone: '+91 98765 43210',
    email: 'contact@sparkle.com',
    gstin: '22AAAAA0000A1Z5',
    taxRate: 18,
    currency: 'INR',
    printPaperSize: 'thermal',
    globalDiscount: { enabled: false, type: 'percentage', value: 0 }
  });

  const fetchSettings = async () => {
    try {
      const res = await axios.get(API_URLS.SETTINGS);
      if (res.data) setSettings(res.data);
    } catch (err) { console.error('Failed to fetch settings:', err); }
  };

  useEffect(() => { fetchSettings(); }, []);

  return (
    <SettingsContext.Provider value={{ settings, setSettings, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
