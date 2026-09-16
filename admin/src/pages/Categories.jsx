import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URLS } from '../api/config';
import { 
  Plus, Search, Edit2, Trash2, Tag, Info, 
  CheckCircle2, AlertCircle, X, LayoutGrid 
} from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', icon: '📦', description: '' });
  const [message, setMessage] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URLS.BASE}/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URLS.BASE}/categories/${editingId}`, formData);
        setMessage({ type: 'success', text: 'Category updated successfully!' });
      } else {
        await axios.post(`${API_URLS.BASE}/categories`, formData);
        setMessage({ type: 'success', text: 'New category created!' });
      }
      setShowModal(false);
      setFormData({ name: '', icon: '📦', description: '' });
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Something went wrong' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This won\'t delete products, but they will become "Other".')) return;
    try {
      await axios.delete(`${API_URLS.BASE}/categories/${id}`);
      fetchCategories();
    } catch {
      alert('Delete failed');
    }
  };

  const openModal = (cat = null) => {
    if (cat) {
      setFormData({ name: cat.name, icon: cat.icon || '📦', description: cat.description || '' });
      setEditingId(cat._id);
    } else {
      setFormData({ name: '', icon: '📦', description: '' });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Product Categories</h2>
          <p className="text-muted small">Manage classifications for your inventory</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center justify-content-center gap-2 px-4 py-2 rounded-pill shadow-sm align-self-start" onClick={() => openModal()}>
          <Plus size={18} /> Add Category
        </button>
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} d-flex align-items-center gap-2 shadow-sm border-0 mb-4`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
          <button className="btn-close ms-auto" onClick={() => setMessage(null)}></button>
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white p-3 border-bottom border-light">
          <div className="position-relative" style={{ maxWidth: '400px' }}>
            <Search className="position-absolute top-50 translate-middle-y ms-3 text-muted" size={16} />
            <input 
              type="text" 
              className="form-control ps-5 rounded-pill border-light bg-light" 
              placeholder="Search categories..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 py-3 text-uppercase small fw-bold text-muted">Category</th>
                  <th className="py-3 text-uppercase small fw-bold text-muted">Description</th>
                  <th className="py-3 text-uppercase small fw-bold text-muted text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="3" className="text-center py-5 text-muted">Loading categories...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="3" className="text-center py-5 text-muted">No categories found</td></tr>
                ) : (
                  filtered.map(cat => (
                    <tr key={cat._id}>
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="rounded-3 bg-primary bg-opacity-10 p-2 text-primary fs-4">
                            {cat.icon || '📦'}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{cat.name}</div>
                            <div className="text-muted x-small">ID: {cat._id.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-muted">{cat.description || 'No description'}</td>
                      <td className="py-3 text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <button className="btn btn-light btn-sm rounded-3 text-primary" onClick={() => openModal(cat)}>
                            <Edit2 size={15} />
                          </button>
                          <button className="btn btn-light btn-sm rounded-3 text-danger" onClick={() => handleDelete(cat._id)}>
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
          <div className="card border-0 shadow-lg rounded-4 w-100" style={{ maxWidth: '500px' }}>
            <div className="card-header bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">{editingId ? 'Edit Category' : 'Create New Category'}</h5>
              <button className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="card-body p-4">
                <div className="mb-3">
                  <label className="form-label small fw-bold">Category Name</label>
                  <input 
                    required 
                    type="text" 
                    className="form-control rounded-3" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Gift Boxes"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Icon (Emoji)</label>
                  <input 
                    type="text" 
                    className="form-control rounded-3" 
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    placeholder="e.g. 🎁"
                  />
                </div>
                <div className="mb-0">
                  <label className="form-label small fw-bold">Description</label>
                  <textarea 
                    className="form-control rounded-3" 
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Optional details about this category"
                  ></textarea>
                </div>
              </div>
              <div className="card-footer bg-white p-3 border-top d-flex gap-2">
                <button type="button" className="btn btn-light rounded-pill flex-grow-1" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary rounded-pill flex-grow-1 fw-bold">
                  {editingId ? 'Update Category' : 'Save Category'}
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
        .x-small { font-size: 0.65rem; }
      `}</style>
    </div>
  );
};

export default Categories;
