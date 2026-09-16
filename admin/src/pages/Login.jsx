import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, User, LogIn, Sparkles, ArrowLeft, AlertCircle } from 'lucide-react';
import { API_URLS } from '../api/config';
import { setToken } from '../utils/auth';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [creds, setCreds] = useState({ username: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URLS.BASE}/auth/login`, creds);
      setToken(res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="login-card p-4 bg-white rounded-4 shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-4">
          <div className="bg-primary d-inline-flex p-3 rounded-circle mb-3 shadow-sm text-white">
            <Lock size={32} />
          </div>
          <h3 className="fw-bold mb-1">Admin Login</h3>
          <p className="text-muted small">Access your shop dashboard</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small" role="alert">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label small fw-bold">Username</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-0"><User size={18} className="text-muted" /></span>
              <input 
                type="text" 
                className="form-control bg-light border-0" 
                placeholder="Enter username" 
                required
                value={creds.username}
                onChange={e => setCreds({ ...creds, username: e.target.value })}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="form-label small fw-bold">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-0"><Lock size={18} className="text-muted" /></span>
              <input 
                type="password" 
                className="form-control bg-light border-0" 
                placeholder="••••••••" 
                required
                value={creds.password}
                onChange={e => setCreds({ ...creds, password: e.target.value })}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <div className="spinner-border spinner-border-sm" />
            ) : (
              <>
                <LogIn size={20} /> Sign In
              </>
            )}
          </button>
        </form>

        <button
          type="button"
          className="btn btn-link w-100 mt-3 text-decoration-none d-flex align-items-center justify-content-center gap-2 fw-bold small"
          onClick={() => { window.location.href = import.meta.env.VITE_SHOP_URL || 'https://sparkle-hub-billing.onrender.com'; }}
        >
          <ArrowLeft size={16} /> Back to Shop
        </button>

        <div className="text-center mt-3 pt-2 border-top">
          <p className="text-muted x-small mb-0 d-flex align-items-center justify-content-center gap-1">
            <Sparkles size={12} className="text-primary" />
            Powered by ShopERP Cloud v2.0
          </p>
        </div>
      </div>

      <style>{`
        .login-container {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          font-family: 'Inter', sans-serif;
        }
        .login-card {
          border: 1px solid rgba(0,0,0,0.05);
          transition: transform 0.3s ease;
        }
        .login-card:hover {
          transform: translateY(-5px);
        }
        .x-small { font-size: 0.7rem; }
      `}</style>
    </div>
  );
};

export default Login;
