import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URLS } from '../api/config';
import { PAGE_DEFS } from '../constants/pages';
import {
  Plus, Edit2, Trash2, ShieldCheck, CheckCircle2, AlertCircle, KeyRound, History
} from 'lucide-react';

const emptyForm = { username: '', password: '', allowedPages: [] };

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(API_URLS.USERS);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePage = (key) => {
    setFormData(f => ({
      ...f,
      allowedPages: f.allowedPages.includes(key)
        ? f.allowedPages.filter(p => p !== key)
        : [...f.allowedPages, key],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { username: formData.username, allowedPages: formData.allowedPages };
      if (formData.password) payload.password = formData.password;

      if (editingId) {
        await axios.put(`${API_URLS.USERS}/${editingId}`, payload);
        setMessage({ type: 'success', text: 'User updated successfully!' });
      } else {
        if (!formData.password) {
          setMessage({ type: 'error', text: 'Password is required for a new user' });
          return;
        }
        await axios.post(API_URLS.USERS, payload);
        setMessage({ type: 'success', text: 'New user created!' });
      }
      setShowModal(false);
      setFormData(emptyForm);
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Something went wrong' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? They will no longer be able to log in.')) return;
    try {
      await axios.delete(`${API_URLS.USERS}/${id}`);
      fetchUsers();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const toggleActive = async (user) => {
    try {
      await axios.put(`${API_URLS.USERS}/${user._id}`, { active: !user.active });
      fetchUsers();
    } catch (err) {
      alert('Update failed');
    }
  };

  const openModal = (user = null) => {
    if (user) {
      setFormData({ username: user.username, password: '', allowedPages: user.allowedPages || [] });
      setEditingId(user._id);
    } else {
      setFormData(emptyForm);
      setEditingId(null);
    }
    setShowModal(true);
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Staff Management</h2>
          <p className="text-muted small">Create logins and choose which pages each user can see</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-light d-flex align-items-center justify-content-center gap-2 px-4 py-2 rounded-pill shadow-sm flex-fill text-nowrap" onClick={() => navigate('/users/logs')}>
            <History size={18} /> Activity Log
          </button>
          <button className="btn btn-primary d-flex align-items-center justify-content-center gap-2 px-4 py-2 rounded-pill shadow-sm flex-fill text-nowrap" onClick={() => openModal()}>
            <Plus size={18} /> Add User
          </button>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} d-flex align-items-center gap-2 shadow-sm border-0 mb-4`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
          <button className="btn-close ms-auto" onClick={() => setMessage(null)}></button>
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 py-3 text-uppercase small fw-bold text-muted">User</th>
                  <th className="py-3 text-uppercase small fw-bold text-muted">Page Access</th>
                  <th className="py-3 text-uppercase small fw-bold text-muted text-center">Status</th>
                  <th className="py-3 text-uppercase small fw-bold text-muted text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-5 text-muted">Loading users...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-5 text-muted">No staff accounts yet</td></tr>
                ) : (
                  users.map(user => (
                    <tr key={user._id}>
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="rounded-3 bg-primary bg-opacity-10 p-2 text-primary">
                            <ShieldCheck size={18} />
                          </div>
                          <div className="fw-bold text-dark">{user.username}</div>
                        </div>
                      </td>
                      <td className="py-3">
                        {user.allowedPages?.length ? (
                          <div className="d-flex flex-wrap gap-1">
                            {user.allowedPages.map(key => (
                              <span key={key} className="badge bg-light text-dark border rounded-pill px-2 py-1 fw-normal">
                                {PAGE_DEFS.find(p => p.key === key)?.label || key}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted small">No pages assigned</span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        <button
                          className={`btn btn-sm rounded-pill px-3 ${user.active ? 'btn-success' : 'btn-secondary'}`}
                          onClick={() => toggleActive(user)}
                        >
                          {user.active ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-3 text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <button className="btn btn-light btn-sm rounded-3 text-primary" onClick={() => openModal(user)}>
                            <Edit2 size={15} />
                          </button>
                          <button className="btn btn-light btn-sm rounded-3 text-danger" onClick={() => handleDelete(user._id)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay d-flex align-items-center justify-content-center">
          <div className="card border-0 shadow-lg rounded-4 w-100" style={{ maxWidth: '520px' }}>
            <div className="card-header bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">{editingId ? 'Edit User' : 'Create New User'}</h5>
              <button className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="card-body p-4">
                <div className="mb-3">
                  <label className="form-label small fw-bold">Username</label>
                  <input
                    required
                    type="text"
                    className="form-control rounded-3"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. billing_staff"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold d-flex align-items-center gap-2">
                    <KeyRound size={14} /> {editingId ? 'New Password' : 'Password'}
                  </label>
                  <input
                    type="password"
                    className="form-control rounded-3"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingId ? 'Leave blank to keep current password' : 'Minimum 6 characters'}
                  />
                </div>
                <div className="mb-0">
                  <label className="form-label small fw-bold">Pages this user can see</label>
                  <div className="row row-cols-2 g-2">
                    {PAGE_DEFS.map(page => (
                      <div className="col" key={page.key}>
                        <label className="d-flex align-items-center gap-2 border rounded-3 px-3 py-2" style={{ cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            className="form-check-input m-0"
                            checked={formData.allowedPages.includes(page.key)}
                            onChange={() => togglePage(page.key)}
                          />
                          <span className="small">{page.label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="card-footer bg-white p-3 border-top d-flex gap-2">
                <button type="button" className="btn btn-light rounded-pill flex-grow-1" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary rounded-pill flex-grow-1 fw-bold">
                  {editingId ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(4px);
          z-index: 2000;
        }
      `}</style>
    </div>
  );
};

export default Users;
