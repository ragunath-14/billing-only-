import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { clearToken, hasPageAccess, isAdmin } from '../utils/auth';
import {
  LayoutDashboard, Package, ShoppingCart,
  Users, Clock, Settings, LogOut, LayoutGrid,
  BarChart3, FileText,
  ChevronRight, Sparkles, UserCog
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const Sidebar = ({ onLogoClick }) => {
  const navigate = useNavigate();
  const { settings } = useSettings();

  const handleLogout = () => {
    clearToken();
    navigate('/login');
  };

  const sections = [
    {
      title: 'Sales & Inventory',
      items: [
        { to: '/',         page: 'dashboard', icon: <LayoutDashboard size={17} />, label: 'Dashboard' },
        { to: '/billing',  page: 'billing',   icon: <ShoppingCart size={17} />,    label: 'Billing' },
        { to: '/products', page: 'products',  icon: <Package size={17} />,         label: 'Inventory' },
        { to: '/categories', page: 'categories', icon: <LayoutGrid size={17} />,   label: 'Categories' },
        { to: '/pending',  page: 'pending',   icon: <Clock size={17} />,           label: 'Pending Payments' },
      ]
    },
    {
      title: 'Customer Management',
      items: [
        { to: '/customers', page: 'customers', icon: <Users size={17} />,          label: 'Customers' },
      ]
    },
  ]
    .map(section => ({ ...section, items: section.items.filter(item => hasPageAccess(item.page)) }))
    .filter(section => section.items.length > 0);

  const admin = isAdmin();

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon"><Sparkles size={18} strokeWidth={2.5} /></div>
        <div className="brand-info">
          <span className="brand-name">{settings.shopName || 'ShopERP'}</span>
          <span className="brand-status">Online Store Active</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {sections.map((section, idx) => (
          <div key={idx} className="sidebar-section">
            <div className="section-header">{section.title}</div>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-link-item${isActive ? ' active' : ''}`}
                onClick={onLogoClick}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.to !== '/' && <ChevronRight className="nav-chevron" size={12} />}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        {admin && (
          <NavLink to="/users" className="nav-link-item mb-2">
            <UserCog size={17} />
            <span>Staff Management</span>
          </NavLink>
        )}
        {hasPageAccess('settings') && (
          <NavLink to="/settings" className="nav-link-item mb-2">
            <Settings size={17} />
            <span>System Settings</span>
          </NavLink>
        )}
        <div className="nav-link-item logout-link" onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <LogOut size={17} />
          <span>Logout</span>
        </div>
      </div>

      <style>{`
        .sidebar-section {
          margin-bottom: 1.5rem;
        }
        .section-header {
          padding: 0 1.25rem 0.5rem;
          font-size: 0.65rem;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .nav-link-item {
          display: flex;
          align-items: center;
          padding: 0.75rem 1.25rem;
          color: #cbd5e1;
          text-decoration: none;
          transition: all 0.2s;
          border-radius: 0;
          margin: 0;
          position: relative;
        }
        .nav-link-item:hover {
          background: rgba(255,255,255,0.05);
          color: #fff;
        }
        .nav-link-item.active {
          background: rgba(37, 99, 235, 0.15);
          color: #60a5fa;
          border-right: 3px solid #3b82f6;
        }
        .nav-icon {
          margin-right: 0.75rem;
          display: flex;
          align-items: center;
        }
        .nav-label {
          flex: 1;
          font-size: 0.85rem;
          font-weight: 500;
        }
        .nav-chevron {
          opacity: 0;
          transition: opacity 0.2s;
        }
        .nav-link-item:hover .nav-chevron {
          opacity: 0.5;
        }
        .logout-link {
          color: #f87171 !important;
        }
        .sidebar-footer {
          margin-top: auto;
          padding-bottom: 1rem;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 1rem;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
