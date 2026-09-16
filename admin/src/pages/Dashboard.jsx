import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import DashboardStats from '../components/dashboard/DashboardStats';
import RecentSalesTable from '../components/dashboard/RecentSalesTable';
import { API_URLS } from '../api/config';

const Dashboard = () => {
  const API = `${API_URLS.SALES}/stats`;
  const [stats, setStats] = useState({ totalProducts: 0, lowStock: 0, totalSales: 0, revenue: 0, recentSales: [] });
  const [loading, setLoading] = useState(true);
  const cache = useRef({ data: null, time: 0 });

  const fetchStats = () => {
    const now = Date.now();
    // Cache management
    if (cache.current.data && now - cache.current.time < 15000) {
      setStats(cache.current.data);
      setLoading(false);
      return;
    }
    axios.get(API).then(res => {
      cache.current = { data: res.data, time: Date.now() };
      setStats(res.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const deleteSale = async (id) => {
    try {
      await axios.delete(`${API_URLS.SALES}/${id}`);
      // Refresh after deletion
      cache.current = { data: null, time: 0 };
      fetchStats();
    } catch { alert('Error deleting sale'); }
  };

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
      <div className="spinner-border text-primary" />
    </div>
  );

  return (<>
    <DashboardStats stats={stats} />
    <RecentSalesTable sales={stats.recentSales} onDelete={deleteSale} />
  </>);
};

export default Dashboard;
