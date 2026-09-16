import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URLS } from '../api/config';
import { ArrowLeft, History, UserPlus, UserCog, UserX } from 'lucide-react';

const ACTION_META = {
  created: { label: 'Created', icon: <UserPlus size={14} />, badge: 'bg-success-subtle text-success border-success' },
  updated: { label: 'Updated', icon: <UserCog size={14} />, badge: 'bg-primary-subtle text-primary border-primary' },
  deleted: { label: 'Deleted', icon: <UserX size={14} />, badge: 'bg-danger-subtle text-danger border-danger' },
};

const UserActivityLog = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URLS.USERS}/logs`)
      .then(res => setLogs(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2"><History size={22} /> User Activity Log</h2>
          <p className="text-muted small">Every change made to staff logins and their page access</p>
        </div>
        <button className="btn btn-light rounded-pill d-flex align-items-center justify-content-center gap-2 px-3 align-self-start" onClick={() => navigate('/users')}>
          <ArrowLeft size={16} /> Back to Staff Management
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 py-3 text-uppercase small fw-bold text-muted">When</th>
                  <th className="py-3 text-uppercase small fw-bold text-muted">Action</th>
                  <th className="py-3 text-uppercase small fw-bold text-muted">Staff Account</th>
                  <th className="py-3 text-uppercase small fw-bold text-muted">Performed By</th>
                  <th className="py-3 text-uppercase small fw-bold text-muted">Details</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-5 text-muted">Loading activity...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-5 text-muted">No staff-account changes recorded yet</td></tr>
                ) : (
                  logs.map(log => {
                    const meta = ACTION_META[log.action] || { label: log.action, icon: null, badge: 'bg-light text-dark border' };
                    return (
                      <tr key={log._id}>
                        <td className="ps-4 py-3 text-muted small">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="py-3">
                          <span className={`badge rounded-pill px-3 py-2 border d-inline-flex align-items-center gap-1 ${meta.badge}`}>
                            {meta.icon} {meta.label}
                          </span>
                        </td>
                        <td className="py-3 fw-bold">{log.targetUsername}</td>
                        <td className="py-3 text-muted">{log.performedBy}</td>
                        <td className="py-3 small">{log.details}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserActivityLog;
