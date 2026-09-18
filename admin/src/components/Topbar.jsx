import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bell, AlertTriangle, Package, X, ChevronRight, Menu, Download } from 'lucide-react';
import { API_URLS } from '../api/config';
import { getUserInfo } from '../utils/auth';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

const titles = {
  '/':          'Dashboard',
  '/products':  'Products & Inventory',
  '/billing':   'Point of Sale — Billing',
  '/customers': 'Customers',
  '/pending':   'Payments & Credit',
  '/settings':  'System Settings',
};

const Topbar = ({ onMenuClick }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [lowStockCount, setLowStockCount] = useState(0);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  // Fetch low stock count from dashboard stats
  const fetchLowStock = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URLS.SALES}/stats`);
      setLowStockCount(res.data.lowStock || 0);
    } catch {
      // silently fail
    }
  }, []);

  // Fetch actual low stock product names when dropdown opens
  const fetchLowStockItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URLS.PRODUCTS);
      const lowItems = res.data
        .filter(p => p.stock < (p.lowStockThreshold || 5))
        .map(p => ({
          _id: p._id,
          name: p.name,
          brand: p.brand,
          stock: p.stock,
          threshold: p.lowStockThreshold || 5,
        }))
        .slice(0, 10); // Show max 10 items
      setLowStockItems(lowItems);
    } catch {
      setLowStockItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and when pathname changes
  useEffect(() => {
    fetchLowStock();
  }, [pathname, fetchLowStock]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(fetchLowStock, 15000);
    return () => clearInterval(interval);
  }, [fetchLowStock]);

  // Fetch items when dropdown opens
  useEffect(() => {
    if (showDropdown) {
      fetchLowStockItems();
    }
  }, [showDropdown, fetchLowStockItems]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        bellRef.current && !bellRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };

  const goToInventory = () => {
    setShowDropdown(false);
    navigate('/products');
  };

  const title = titles[pathname] || 'Sparkle Hub';
  const user = getUserInfo();
  const username = user?.username || 'Account';
  const { available: canInstall, install } = useInstallPrompt();

  return (
    <div className="topbar">
      <div className="d-flex align-items-center gap-3">
        <button className="btn btn-light btn-icon d-lg-none" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <span className="topbar-title">{title}</span>
      </div>
      <div className="topbar-right">
        {canInstall && (
          <button
            className="btn btn-primary btn-sm d-none d-sm-flex align-items-center gap-2"
            onClick={install}
            title="Install this app on your desktop"
          >
            <Download size={15} /> Install App
          </button>
        )}
        {/* Bell Notification Button */}
        <div style={{ position: 'relative' }}>
          <button
            ref={bellRef}
            className="btn btn-light btn-icon"
            title="Low Stock Alerts"
            onClick={toggleDropdown}
            style={{
              position: 'relative',
              background: showDropdown ? '#f1f5f9' : 'transparent',
              border: 'none',
              borderRadius: '10px',
              padding: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Bell size={20} style={{ color: lowStockCount > 0 ? '#1e293b' : '#94a3b8' }} />
            {lowStockCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 700,
                minWidth: '18px',
                height: '18px',
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
                animation: 'pulse-badge 2s ease-in-out infinite',
                lineHeight: 1,
              }}>
                {lowStockCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div
              ref={dropdownRef}
              className="notification-dropdown"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '360px',
                background: '#fff',
                borderRadius: '14px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0',
                zIndex: 1000,
                overflow: 'hidden',
                animation: 'slideDown 0.2s ease-out',
              }}
            >
              {/* Dropdown Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 18px',
                borderBottom: '1px solid #f1f5f9',
                background: '#fafbfc',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: lowStockCount > 0 ? 'linear-gradient(135deg, #fef2f2, #fee2e2)' : '#f0fdf4',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <AlertTriangle size={16} style={{ color: lowStockCount > 0 ? '#ef4444' : '#22c55e' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>Low Stock Alerts</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {lowStockCount > 0 ? `${lowStockCount} item${lowStockCount !== 1 ? 's' : ''} need attention` : 'All items are in stock'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDropdown(false)}
                  style={{
                    background: 'none', border: 'none', padding: '4px',
                    cursor: 'pointer', color: '#94a3b8', borderRadius: '6px',
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Dropdown Body */}
              <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '8px' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    <div className="spinner-border spinner-border-sm text-primary" style={{ width: '20px', height: '20px' }} />
                    <div style={{ fontSize: '0.8rem', marginTop: '8px' }}>Loading alerts...</div>
                  </div>
                ) : lowStockItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    <Package size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>All Good! 🎉</div>
                    <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>No low stock items found</div>
                  </div>
                ) : (
                  lowStockItems.map((item) => (
                    <div
                      key={item._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        marginBottom: '2px',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      onClick={goToInventory}
                    >
                      {/* Stock Level Indicator */}
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '10px',
                        background: item.stock === 0
                          ? 'linear-gradient(135deg, #fef2f2, #fee2e2)'
                          : 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <span style={{
                          fontWeight: 800, fontSize: '0.85rem',
                          color: item.stock === 0 ? '#ef4444' : '#f59e0b',
                        }}>
                          {item.stock}
                        </span>
                      </div>

                      {/* Item Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 600, fontSize: '0.85rem', color: '#1e293b',
                          whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden',
                        }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {item.brand} · Threshold: {item.threshold}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 700, padding: '3px 8px',
                        borderRadius: '6px', whiteSpace: 'nowrap',
                        background: item.stock === 0 ? '#fef2f2' : '#fffbeb',
                        color: item.stock === 0 ? '#dc2626' : '#d97706',
                      }}>
                        {item.stock === 0 ? 'OUT' : 'LOW'}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Dropdown Footer */}
              {lowStockItems.length > 0 && (
                <div style={{
                  padding: '12px 18px',
                  borderTop: '1px solid #f1f5f9',
                  background: '#fafbfc',
                }}>
                  <button
                    onClick={goToInventory}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '6px',
                      background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                      color: '#fff', border: 'none', borderRadius: '8px',
                      padding: '10px', fontWeight: 600, fontSize: '0.82rem',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  >
                    View All in Inventory <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="avatar">{username.charAt(0).toUpperCase()}</div>
        <div className="admin-text" style={{ lineHeight: 1 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{username}</div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{user?.role === 'admin' ? 'Shop Owner' : 'Staff'}</div>
        </div>
      </div>

      {/* Keyframe animations injected inline */}
      <style>{`
        @keyframes pulse-badge {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default React.memo(Topbar);
